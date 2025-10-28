import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { PROFILE_PICTURE_PRESETS, ProfilePicturePreset } from '@/constants/profilePictures';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSetupScreen() {
  const [realName, setRealName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [selectedPicture, setSelectedPicture] = useState<ProfilePicturePreset | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, createAccount } = useAuth();

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload a profile picture!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomImage(result.assets[0].uri);
      setSelectedPicture(null); // Clear preset selection
    }
  };

  const handleContinue = async () => {
    if (!profileName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!selectedPicture && !customImage) {
      setError('Please select a profile picture');
      return;
    }

    setLoading(true);
    setError('');

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setError('Request timed out. Please try again.');
      setLoading(false);
    }, 30000); // 30 second timeout

    try {
      // User should already exist from signup
      if (!user) {
        setError('No user found. Please sign up first.');
        setLoading(false);
        return;
      }

      // Create/update the profile
      console.log('Creating profile...');
      
      let profilePicUrl = selectedPicture?.id;
      let customImageUri = undefined;

      // If custom image is selected, pass it to createAccount for upload
      if (customImage) {
        console.log('Using custom image upload');
        customImageUri = customImage;
        profilePicUrl = undefined; // Don't use preset when custom image is selected
      }

      const { error: profileError } = await createAccount({
        real_name: realName.trim() || undefined,
        profile_name: profileName.trim(),
        profile_pic_url: profilePicUrl,
        custom_image_uri: customImageUri,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setError(profileError.message);
        setLoading(false);
        return;
      }

      console.log('Profile created successfully, navigating...');
      // Clear timeout and navigate to main app
      clearTimeout(timeoutId);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Unexpected error:', err);
      clearTimeout(timeoutId);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            {user ? 'Complete your profile to get started' : 'Tell us a bit about yourself to get started'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Real Name (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Real Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your real name"
              placeholderTextColor="#999"
              value={realName}
              onChangeText={setRealName}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              This can be used for groups that require real names
            </Text>
          </View>

          {/* Display Name (Required) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="How others will see you"
              placeholderTextColor="#999"
              value={profileName}
              onChangeText={setProfileName}
              editable={!loading}
            />
            <Text style={styles.helperText}>
              This is how you'll appear to friends
            </Text>
          </View>

          {/* Profile Picture Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Picture *</Text>
            <View style={styles.pictureGrid}>
              {/* Custom Image Upload - First position */}
              <TouchableOpacity
                style={[styles.pictureOption, customImage && styles.pictureOptionSelected]}
                onPress={pickImage}
                disabled={loading}
              >
                <View style={[styles.pictureCircle, { backgroundColor: '#fff' }]}>
                  {customImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: customImage }} style={styles.customImagePreview} />
                      <View style={styles.circularOverlay} />
                    </View>
                  ) : (
                    <View style={styles.uploadContent}>
                      <Text style={styles.uploadIcon}>+</Text>
                      <Text style={styles.uploadText}>upload</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Preset Emojis */}
              {PROFILE_PICTURE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.pictureOption,
                    selectedPicture?.id === preset.id && styles.pictureOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedPicture(preset);
                    setCustomImage(null); // Clear custom image
                  }}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.pictureCircle,
                      { backgroundColor: preset.color },
                    ]}
                  >
                    <Text style={styles.pictureEmoji}>{preset.emoji}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting up...' : 'Continue'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputGroup: {
    marginBottom: 24,
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pictureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pictureOption: {
    width: '22%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  pictureOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  pictureCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pictureEmoji: {
    fontSize: 30,
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  uploadText: {
    fontSize: 8,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  customImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  circularOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});
