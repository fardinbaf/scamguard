
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser as fetchCurrentUser, loginUser as serviceLoginUser, logoutUser as serviceLogoutUser, signupUser as serviceSignupUser, UserCredentials, verifyUser as serviceVerifyUser } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<User | null>;
  logout: () => void;
  signup: (credentials: UserCredentials) => Promise<User | null>; // Returns unverified user
  // verify: (identifier: string, code: string) => Promise<User | null>; // verify now happens in SignUpModal, then login
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncCurrentUser = () => {
    const user = fetchCurrentUser();
    setCurrentUser(user);
    return user;
  }

  useEffect(() => {
    syncCurrentUser();
    setIsLoading(false);
  }, []);

  const login = async (credentials: UserCredentials): Promise<User | null> => {
    setIsLoading(true);
    const user = await serviceLoginUser(credentials);
    setCurrentUser(user); // Directly set from login response
    setIsLoading(false);
    return user;
  };

  const logout = () => {
    serviceLogoutUser();
    setCurrentUser(null);
  };

  const signup = async (credentials: UserCredentials): Promise<User | null> => {
    setIsLoading(true);
    // Signup service no longer auto-logins. It returns the created user (unverified).
    const user = await serviceSignupUser(credentials); 
    setIsLoading(false);
    // The actual login (and setting currentUser) will happen after the simulated verification step in SignUpModal.
    // So, we don't call setCurrentUser here.
    return user; 
  };
  
  // Expose a way to refresh current user, e.g. after verification
  // This is handled by login being called after successful verification in SignUpModal.

  const isAuthenticated = !!currentUser && !!currentUser.isVerified; // User is authenticated if logged in AND verified
  const isAdmin = currentUser?.isAdmin || false;

  // This effect ensures that if localStorage changes (e.g. by another tab or manual verification), UI updates.
  // This is particularly important for the `isAuthenticated` check that now includes `isVerified`.
  useEffect(() => {
    const handleStorageChange = () => {
        syncCurrentUser();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};