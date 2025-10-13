import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { createAutomaticAccount } = useAuth();

  const handleGetStarted = async () => {
    setLoading(true);

    const { error } = await createAutomaticAccount();

    if (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      setLoading(false);
    } else {
      // Navigate to profile setup
      router.replace('/(auth)/profile-setup');
    }
  };

  const handleSignIn = () => {
    // For existing users who want to sign in with email/password
    Alert.alert(
      'Sign In',
      'Email/password sign-in is not available yet. Please use "Get Started" to create a new account.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Weak Link</Text>
        <Text style={styles.subtitle}>Stay accountable with friends</Text>
        <Text style={styles.description}>
          Track your app usage and compete with friends to avoid being the weak link
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGetStarted}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          style={styles.signInButton}
        >
          <Text style={styles.signInText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    padding: 12,
  },
  signInText: {
    color: '#666',
    fontSize: 16,
  },
});

