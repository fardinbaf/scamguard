

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { Session } from '@supabase/supabase-js';
import { AuthData } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: authService.UserCredentials) => Promise<AuthData>;
  logout: () => Promise<void>;
  signup: (credentials: authService.UserCredentials) => Promise<AuthData>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect 1: Manages the raw Supabase session state.
  useEffect(() => {
    // Fetch initial session on app load.
    authService.getCurrentSession().then(s => {
        setSession(s);
        setIsLoading(false); // End loading after first session check.
    });

    // Listen for any subsequent changes in auth state.
    const { data: authListener } = authService.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // If user logs out, clear the profile immediately.
      if (!newSession) {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Effect 2: Manages the application's user profile, reacting to session changes.
  useEffect(() => {
    if (session?.user) {
      const supabaseUser = session.user;
      authService.getUserProfile(supabaseUser.id)
        .then(profile => {
          if (profile) {
            // Success case: Profile found in the database.
            setCurrentUser(profile);
          } else {
            // Fallback case: No profile in DB. Create a temporary client-side one.
            // This handles the race condition on signup where the trigger hasn't finished yet.
            console.warn(`No database profile found for user ${supabaseUser.id}. Using temporary profile.`);
            setCurrentUser({
              id: supabaseUser.id,
              identifier: supabaseUser.email || 'user',
              isAdmin: false,
              isBanned: false,
              fullName: null,
              phoneNumber: null,
              avatarUrl: null,
            });
          }
        })
        .catch(error => {
          // Error case: The profile fetch failed for some reason (e.g., RLS, network).
          // Keep the user logged in but with safe, default permissions.
          console.error("Error fetching user profile, using fallback:", error);
          setCurrentUser({
            id: supabaseUser.id,
            identifier: supabaseUser.email || 'user',
            isAdmin: false,
            isBanned: false,
            fullName: null,
            phoneNumber: null,
            avatarUrl: null,
          });
        });
    }
  }, [session]);

  const refreshUser = useCallback(async () => {
     if (session?.user) {
        try {
            const profile = await authService.getUserProfile(session.user.id);
            if (profile) {
                setCurrentUser(profile);
            }
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
     }
  }, [session]);

  const login = async (credentials: authService.UserCredentials): Promise<AuthData> => {
    return authService.loginUser(credentials);
  };

  const logout = async () => {
    await authService.logoutUser();
    // The auth listener will clear the session and user profile.
  };

  const signup = async (credentials: authService.UserCredentials): Promise<AuthData> => {
    return authService.signupUser(credentials);
  };
  
  const isAuthenticated = !!currentUser && !currentUser.isBanned;
  const isAdmin = currentUser?.isAdmin || false;

  const value = { 
      currentUser, 
      isAuthenticated, 
      isAdmin, 
      isLoading, // isLoading now represents the initial session check.
      login, 
      logout, 
      signup, 
      refreshUser 
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
