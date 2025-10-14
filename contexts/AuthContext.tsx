import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAnonymously: () => Promise<{ error: any }>;
  createAutomaticAccount: () => Promise<{ error: any }>;
  createProfile: (profileData: {
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

  useEffect(() => {
    // For now, we'll skip the session check since we're using integer IDs
    setLoading(false);
    
    // If we have a currentUserId, fetch the user profile
    if (currentUserId) {
      fetchUserProfile(currentUserId).then((profile) => {
        setUserProfile(profile);
      });
    }
  }, [currentUserId]);

  const signUp = async (email: string, password: string, profileName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          profile_name: profileName,
        });

      if (profileError) return { error: profileError };

      // Set the current user ID
      setCurrentUserId(data.user.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInAnonymously = async () => {
    try {
      // Generate a random integer ID
      const randomId = Math.floor(Math.random() * 1000000000);
      
      // Create a basic user profile with required fields
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: randomId,
          profile_name: `User_${randomId}`, // Ensure this is always set
          real_name: null,
          profile_pic_url: null,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { error: profileError };
      }

      // Set the current user ID
      setCurrentUserId(randomId);

      return { error: null };
    } catch (err) {
      console.error('Error in signInAnonymously:', err);
      return { error: { message: 'Failed to create account' } };
    }
  };

  // New method to automatically create an account
  const createAutomaticAccount = async () => {
    return await signInAnonymously();
  };

  const createProfile = async (profileData: {
    real_name?: string;
    profile_name: string;
    profile_pic_url?: string;
  }) => {
    // Use the current user ID
    if (!currentUserId) {
      return { error: { message: 'No current user found' } };
    }

    const { error } = await supabase
      .from('users')
      .update({
        real_name: profileData.real_name,
        profile_name: profileData.profile_name,
        profile_pic_url: profileData.profile_pic_url,
      })
      .eq('id', currentUserId);

    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }

    // Refresh user profile
    const updatedProfile = await fetchUserProfile(currentUserId);
    setUserProfile(updatedProfile);

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Create a mock user object when we have a currentUserId
  const mockUser = currentUserId ? { id: currentUserId } : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: mockUser,
        userProfile,
        loading,
        signUp,
        signIn,
        signInAnonymously,
        createAutomaticAccount,
        createProfile,
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
