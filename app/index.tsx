import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function IndexScreen() {
  const { user, userProfile, loading } = useAuth();

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
        // No user, show welcome screen to let them choose how to proceed
        router.replace('/(auth)/welcome');
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
