import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { PROFILE_PICTURE_PRESETS, ProfilePicturePreset } from '@/constants/profilePictures';

interface ProfilePictureProps {
  profilePicUrl?: string | null;
  size?: number;
  style?: any;
}

export default function ProfilePicture({ 
  profilePicUrl, 
  size = 40, 
  style 
}: ProfilePictureProps) {
  // Check if it's an image URL (HTTP/HTTPS or file://)
  if (profilePicUrl && (profilePicUrl.startsWith('http://') || profilePicUrl.startsWith('https://') || profilePicUrl.startsWith('file://'))) {
    return (
      <Image 
        source={{ uri: profilePicUrl }} 
        style={[
          styles.imageContainer,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
          },
          style
        ]}
        resizeMode="cover"
      />
    );
  }
  
  // Find the preset by ID
  const preset = PROFILE_PICTURE_PRESETS.find(p => p.id === profilePicUrl);
  
  if (!preset) {
    // Default fallback
    return (
      <View style={[
        styles.container,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: '#666'
        },
        style
      ]}>
        <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>👤</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: preset.color
      },
      style
    ]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {preset.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    textAlign: 'center',
  },
});
