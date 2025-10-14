import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function IndexScreen() {
  const { user, userProfile, loading, createAutomaticAccount } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if user has completed profile setup
        if (userProfile && userProfile.profile_name && userProfile.profile_pic_url) {
          router.replace('/(tabs)');
        } else {
          // User exists but hasn't completed profile setup
          router.replace('/(auth)/profile-setup');
        }
      } else {
        // No user, automatically create account and go to profile setup
        const autoCreateAccount = async () => {
          const { error } = await createAutomaticAccount();
          if (!error) {
            router.replace('/(auth)/profile-setup');
          } else {
            // If auto-creation fails, show login screen
            router.replace('/(auth)/login');
          }
        };
        autoCreateAccount();
      }
    }
  }, [loading, user, userProfile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
