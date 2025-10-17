import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { createAutomaticAccount, signIn } = useAuth();

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

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    } else {
      // Navigate to main app
      router.replace('/(tabs)');
    }
  };

  const handleShowLoginForm = () => {
    setShowLoginForm(true);
    setError('');
  };

  const handleBackToWelcome = () => {
    router.push('/(auth)/welcome');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Weak Link</Text>
        
        {!showLoginForm ? (
          // Welcome Screen
          <>
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
              onPress={handleShowLoginForm}
              disabled={loading}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Login Form
          <>
            <Text style={styles.subtitle}>Welcome back</Text>
            <Text style={styles.description}>
              Sign in to your account to continue
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              disabled={loading}
              style={styles.signupButton}
            >
              <Text style={styles.signupText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToWelcome}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back to welcome</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  signupButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#007AFF',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
});

