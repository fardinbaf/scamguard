import { supabase } from '../lib/supabase';
import { AdvertisementConfig } from '../types';
import { Database } from '../lib/database.types';

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
  
  return data || { id: CONFIG_ID, is_enabled: false, image_url: null, target_url: null };
};

export const saveAdvertisementConfig = async (formData: FormData): Promise<AdvertisementConfig> => {
  const isEnabled = formData.get('isEnabled') === 'true';
  const targetUrl = formData.get('targetUrl') as string;
  const imageFile = formData.get('image') as File | null;
  const removeImage = formData.get('removeImage') === 'true';

  let imageUrl: string | null = undefined;

  // Handle image upload/removal
  if (imageFile && imageFile.size > 0) {
    // Remove old image if it exists
    const oldConfig = await getAdvertisementConfig();
    if (oldConfig?.image_url) {
        // extract path from url
        const oldPath = oldConfig.image_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }
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
      const oldPath = oldConfig.image_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      }
    }
    imageUrl = null;
  }
  
  const updateData: Database['public']['Tables']['advertisement']['Update'] = {
    is_enabled: isEnabled,
    target_url: targetUrl,
  };

  // Only include imageUrl in the update if it's been changed
  if (imageUrl !== undefined) {
      updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from('advertisement')
    .upsert({ ...updateData, id: CONFIG_ID } as Database['public']['Tables']['advertisement']['Insert']);

  if (error) throw new Error(error.message);
  
  const finalConfig = await getAdvertisementConfig();
  return finalConfig;
};
