'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { localStorageUtils, User, UserProfile } from './local-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = localStorageUtils.getSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const signup = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate inputs
      if (!username || !email || !password) {
        return { success: false, error: 'All fields are required' };
      }

      if (username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if username exists
      if (localStorageUtils.usernameExists(username)) {
        return { success: false, error: 'Username already exists' };
      }

      // Check if email exists
      if (localStorageUtils.emailExists(email)) {
        return { success: false, error: 'Email already registered' };
      }

      // Create user (using simple hash from local-storage)
      const passwordHash = Array.from(new TextEncoder().encode(password))
        .reduce((hash, byte) => ((hash << 5) - hash) + byte, 0)
        .toString(16);
      
      const newUser = localStorageUtils.saveUser({
        username,
        email,
        passwordHash,
        profile: {
          isProfileComplete: false,
        },
      });

      // Set session
      localStorageUtils.saveSession(newUser);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('[v0] Signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      const existingUser = localStorageUtils.getUserByUsername(username);
      if (!existingUser) {
        return { success: false, error: 'Invalid username or password' };
      }

      // For local storage, we'll do simple hash comparison
      // In a real app, use bcrypt on the backend
      const passwordHash = Array.from(new TextEncoder().encode(password))
        .reduce((hash, byte) => ((hash << 5) - hash) + byte, 0)
        .toString(16);

      if (existingUser.passwordHash !== passwordHash) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Set session
      localStorageUtils.saveSession(existingUser);
      setUser(existingUser);

      return { success: true };
    } catch (error) {
      console.error('[v0] Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorageUtils.clearSession();
    setUser(null);
  };

  const updateProfile = async (
    profileUpdates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const updatedUser = localStorageUtils.updateUserProfile(user.id, profileUpdates);
      if (!updatedUser) {
        return { success: false, error: 'Failed to update profile' };
      }

      // Update session
      localStorageUtils.saveSession(updatedUser);
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('[v0] Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signup,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
