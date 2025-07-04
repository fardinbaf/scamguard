import { supabase } from '../lib/supabase';
import { User } from '../types';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface UserCredentials {
  identifier: string; // Email
  password?: string;
}

export interface AuthData {
  user: SupabaseUser | null;
  session: Session | null;
}

// Helper type for raw data from Supabase to avoid 'any'
interface SupabaseProfile {
    id: string;
    identifier: string | null;
    is_admin: boolean;
    is_banned: boolean;
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

const toUser = (profile: SupabaseProfile): User => ({
  id: profile.id,
  identifier: profile.identifier || '',
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

    return data ? toUser(data) : null;
}

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
  return (data || []).map(p => toUser(p as SupabaseProfile));
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