// src/contexts/AuthContext.tsx - UPDATED to use backend API
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, SignUpData } from '../types';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      
      try {
        const token = apiClient.getToken();
        
        if (!token) {
          console.log('❌ No token found');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('✅ Token found, validating...');
        
        // Validate token by getting user info
        const response = await apiClient.getMe();
        
        if (response.success && response.data?.user) {
          console.log('✅ User authenticated:', response.data.user.email);
          setUser(response.data.user);
        } else {
          console.log('❌ Invalid token');
          apiClient.setToken(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('❌ Auth initialization failed:', error);
        apiClient.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, userData: SignUpData): Promise<void> => {
    setLoading(true);
    try {
      console.log('📝 Signing up user:', email);
      
      const response = await apiClient.register({
        email,
        password,
        ...userData,
      });

      if (response.success && response.data) {
        console.log('✅ Sign up successful');
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Account created successfully!');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      const errorMessage = error.message || 'Failed to create account';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('🔑 Signing in user:', email);
      
      const response = await apiClient.login({
        email,
        password,
      });

      if (response.success && response.data) {
        console.log('✅ Sign in successful');
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Signed in successfully!');
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out user');
      
      // Call backend logout (for token blacklisting if implemented)
      try {
        await apiClient.logout();
      } catch (error) {
        // Don't block logout if API call fails
        console.warn('Logout API call failed, continuing with local logout');
      }

      // Clear local state
      apiClient.setToken(null);
      setUser(null);
      toast.success('Signed out successfully!');
      
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      // Even if there's an error, clear local state
      apiClient.setToken(null);
      setUser(null);
      toast.error('Error during sign out, but you have been logged out locally');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('👤 Updating profile...');
      
      const response = await apiClient.updateProfile(data);

      if (response.success && response.data?.user) {
        console.log('✅ Profile updated successfully');
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};