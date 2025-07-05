import { supabase } from '../lib/supabase';
import { User } from '../types';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export interface UserCredentials {
  identifier: string; // Email
  password?: string;
}

export interface AuthData {
  user: SupabaseUser | null;
  session: Session | null;
}

const handleSupabaseError = (error: AuthError | null) => {
  if (error) {
    throw new Error(error.message || 'An authentication error occurred.');
  }
};

export const signupUser = async (credentials: UserCredentials): Promise<AuthData> => {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.identifier,
    password: credentials.password || '',
  });
  handleSupabaseError(error);
  return data;
};

export const loginUser = async (credentials: UserCredentials): Promise<AuthData> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.identifier,
    password: credentials.password || '',
  });
  handleSupabaseError(error);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  handleSupabaseError(error);
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
}

export const getCurrentSession = async (): Promise<Session | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

const toUser = (profile: Database['public']['Tables']['profiles']['Row']): User => ({
  id: profile.id,
  identifier: profile.identifier || '',
  fullName: profile.full_name,
  phoneNumber: profile.phone_number,
  avatarUrl: profile.avatar_url,
  isAdmin: profile.is_admin,
  isBanned: profile.is_banned,
});

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error("Error fetching user profile:", error.message);
        if (error.code === 'PGRST116') return null; // 'PGRST116' means 0 rows found, which is not an error here.
        throw new Error("Could not fetch user profile.");
    }

    if (data && data.avatar_url) {
      // Ensure the avatar URL is a public URL from storage if it's just a path
      if (!data.avatar_url.startsWith('http')) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
        data.avatar_url = publicUrl;
      }
    }

    return data ? toUser(data) : null;
}

export const updateUserProfile = async (
  userId: string,
  updates: { fullName?: string; phoneNumber?: string },
  avatarFile?: File | null
): Promise<User | null> => {
  let newAvatarUrl: string | undefined = undefined;

  // 1. Handle avatar upload
  if (avatarFile) {
    const filePath = `${userId}/${Date.now()}_${avatarFile.name}`;
    
    // Check if there is an old avatar to remove
    const { data: oldProfile, error: fetchError } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    if(fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch old profile for avatar removal: ${fetchError.message}`);
    }

    if(oldProfile?.avatar_url){
        const oldAvatarPath = oldProfile.avatar_url.split('/avatars/')[1];
        if(oldAvatarPath) await supabase.storage.from('avatars').remove([oldAvatarPath]);
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: false });

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }
    
    newAvatarUrl = filePath;
  }

  // 2. Prepare profile data for update
  const profileUpdateData: Database['public']['Tables']['profiles']['Update'] = {
    updated_at: new Date().toISOString()
  };
  if (updates.fullName !== undefined) profileUpdateData.full_name = updates.fullName;
  if (updates.phoneNumber !== undefined) profileUpdateData.phone_number = updates.phoneNumber;
  if (newAvatarUrl) profileUpdateData.avatar_url = newAvatarUrl;
  
  // 3. Update the database
  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message);
  }

  return data ? toUser(data) : null;
};


export const requestPasswordReset = async (identifier: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: `${window.location.origin}/`, // User will be redirected here after reset
    });
    handleSupabaseError(error);
};

// --- User Management Functions (for Admins) ---
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) throw new Error(error.message);
  return (data || []).map(p => toUser(p));
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? toUser(data) : null;
};

export const updateUserBanStatus = async (userId: string, isBanned: boolean): Promise<User | null> => {
   const { data, error } = await supabase
    .from('profiles')
    .update({ is_banned: isBanned, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? toUser(data) : null;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  // Supabase admin client is needed to delete users from auth schema.
  // This is a complex operation not suitable for client-side code.
  // For this app, we will just ban the user, which is safer.
  console.warn("User deletion should be handled by a backend function. For now, this will ban the user.");
  await updateUserBanStatus(userId, true);
  return true;
};
