import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function IndexScreen() {
  const { user, userProfile, loading, isFirstTime } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isFirstTime) {
        // First time user - go directly to signup
        router.replace('/(auth)/signup');
      } else {
        // Returning user - go to main app (auto-signed in)
        router.replace('/(tabs)');
      }
    }
  }, [loading, user, userProfile, isFirstTime]);

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
