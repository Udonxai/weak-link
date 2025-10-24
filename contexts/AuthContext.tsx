import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirstTime: boolean;
  createAccount: (profileData: {
    real_name?: string;
    profile_name: string;
    profile_pic_url?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: number) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  };

  // Check if this is the user's first time opening the app and auto-sign in if account exists
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get device ID for this device
        const deviceId = await getDeviceId();
        
        // Check if we have a stored account for this device
        const storedUserId = await AsyncStorage.getItem(`user_${deviceId}`);
        
        if (storedUserId) {
          // We have an existing account for this device, fetch and sign in
          const userId = parseInt(storedUserId);
          const profile = await fetchUserProfile(userId);
          
          if (profile) {
            setCurrentUserId(userId);
            setUserProfile(profile);
            setIsFirstTime(false);
          } else {
            // Profile not found, treat as first time
            setIsFirstTime(true);
          }
        } else {
          // No account for this device, first time user
          setIsFirstTime(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsFirstTime(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Get or create a unique device ID
  const getDeviceId = async (): Promise<string> => {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        // Create a unique device ID
        deviceId = Device.osInternalBuildId || Device.modelId || `device_${Date.now()}_${Math.random()}`;
        await AsyncStorage.setItem('device_id', deviceId!);
      }
      return deviceId as string;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}_${Math.random()}`;
    }
  };

  useEffect(() => {
    // If we have a currentUserId, fetch the user profile
    if (currentUserId) {
      fetchUserProfile(currentUserId).then((profile) => {
        setUserProfile(profile);
      });
    }
  }, [currentUserId]);

  const createAccount = async (profileData: {
    real_name?: string;
    profile_name: string;
    profile_pic_url?: string;
  }) => {
    try {
      // Create user profile directly in our users table
      // The database will auto-generate the ID using SERIAL
      const { data, error } = await supabase
        .from('users')
        .insert({
          profile_name: profileData.profile_name,
          real_name: profileData.real_name || null,
          profile_pic_url: profileData.profile_pic_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating account:', error);
        
        // Check if it's a unique constraint violation for profile_name
        if (error.code === '23505' && (
          error.message.includes('profile_name') || 
          error.details?.includes('profile_name') ||
          error.message.includes('duplicate key value violates unique constraint')
        )) {
          return { error: { message: 'Profile Name already exists. Please choose a different name.' } };
        }
        
        return { error };
      }

      // Set the current user ID and profile
      setCurrentUserId(data.id);
      setUserProfile(data);

      // Store the user ID associated with this device for future auto-sign in
      const deviceId = await getDeviceId();
      await AsyncStorage.setItem(`user_${deviceId}`, data.id.toString());
      setIsFirstTime(false);

      return { error: null };
    } catch (err) {
      console.error('Error in createAccount:', err);
      return { error: { message: 'Failed to create account' } };
    }
  };



  const signOut = async () => {
    setCurrentUserId(null);
    setUserProfile(null);
    setUser(null);
    // Note: We don't clear the device-user association on sign out
    // so the user can be automatically signed back in next time
  };

  // Create a mock user object when we have a currentUserId
  const mockUser = currentUserId ? { 
    id: currentUserId.toString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: mockUser,
        userProfile,
        loading,
        isFirstTime,
        createAccount,
        signOut,
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
