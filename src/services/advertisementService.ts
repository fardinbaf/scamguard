import { supabase } from '../lib/supabase';
import { AdvertisementConfig } from '../types';

const BUCKET_NAME = 'advertisement';
const CONFIG_ID = 1; // We only ever have one ad config

export const getAdvertisementConfig = async (): Promise<AdvertisementConfig> => {
  const { data, error } = await supabase
    .from('advertisement')
    .select('*')
    .eq('id', CONFIG_ID)
    .single();
    
  if (error && error.code !== 'PGRST116') { // Don't throw if row doesn't exist
    throw new Error(error.message);
  }

  if (data && data.image_url) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.image_url);
      return { ...data, publicURL: publicUrl };
  }
  
  return data || { is_enabled: false, image_url: null, target_url: null };
};

export const saveAdvertisementConfig = async (formData: FormData): Promise<AdvertisementConfig> => {
  const isEnabled = formData.get('isEnabled') === 'true';
  const targetUrl = formData.get('targetUrl') as string;
  const imageFile = formData.get('image') as File | null;
  const removeImage = formData.get('removeImage') === 'true';

  let imageUrl: string | undefined = undefined;

  // Handle image upload/removal
  if (imageFile && imageFile.size > 0) {
    // Remove old image if it exists
    const oldConfig = await getAdvertisementConfig();
    if (oldConfig?.image_url) {
        await supabase.storage.from(BUCKET_NAME).remove([oldConfig.image_url]);
    }
    
    const filePath = `ad_${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);
    imageUrl = filePath;
  } else if (removeImage) {
    const oldConfig = await getAdvertisementConfig();
    if (oldConfig?.image_url) {
        await supabase.storage.from(BUCKET_NAME).remove([oldConfig.image_url]);
    }
    imageUrl = undefined;
  }
  
  const updateData: Partial<AdvertisementConfig> = {
    is_enabled: isEnabled,
    target_url: targetUrl,
  };

  // Only include imageUrl in the update if it's been changed
  if (imageUrl !== undefined || removeImage) {
      updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from('advertisement')
    .upsert({ ...updateData, id: CONFIG_ID }); // Use upsert to handle initial creation

  if (error) throw new Error(error.message);
  
  const finalConfig = await getAdvertisementConfig();
  return finalConfig;
};
