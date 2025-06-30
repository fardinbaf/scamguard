import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: authService.UserCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (credentials: authService.UserCredentials) => Promise<User | null>;
  verify: (identifier: string, code: string) => Promise<User | null>;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("No active session or failed to fetch user");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetUser();
  }, [fetchAndSetUser]);
  
  const refreshUser = useCallback(() => {
    fetchAndSetUser();
  }, [fetchAndSetUser]);

  const login = async (credentials: authService.UserCredentials): Promise<User | null> => {
    const user = await authService.loginUser(credentials);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logoutUser();
    setCurrentUser(null);
  };

  const signup = async (credentials: authService.UserCredentials): Promise<User | null> => {
    // Signup service now calls the backend, which handles creating the unverified user
    // and sending the (simulated) verification email.
    return await authService.signupUser(credentials);
  };

  const verify = async (identifier: string, code: string): Promise<User | null> => {
    return await authService.verifyUser(identifier, code);
  };
  
  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, isLoading, login, logout, signup, verify, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
