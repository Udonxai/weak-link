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
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
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
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
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
          username,
          profile_name: username,
        });

      if (profileError) return { error: profileError };
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
      
      // Create a basic user profile directly
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: randomId,
          profile_name: `User_${randomId}`,
        });

      if (profileError) return { error: profileError };

      return { error: null };
    } catch (err) {
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
    // Get the latest user ID from the users table
    const { data: latestUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !latestUser) {
      return { error: { message: 'No user found' } };
    }

    const { error } = await supabase
      .from('users')
      .update({
        real_name: profileData.real_name,
        profile_name: profileData.profile_name,
        profile_pic_url: profileData.profile_pic_url,
        username: profileData.profile_name, // Keep username in sync
      })
      .eq('id', latestUser.id);

    if (error) return { error };

    // Refresh user profile
    const updatedProfile = await fetchUserProfile(latestUser.id);
    setUserProfile(updatedProfile);

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
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
