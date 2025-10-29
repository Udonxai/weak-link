import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react-native';
import { useState } from 'react';
import ProfilePicture from '@/components/ProfilePicture';
import SettingsScreen from '@/components/SettingsScreen';

export default function ProfileScreen() {
  const { userProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            <ProfilePicture 
              profilePicUrl={userProfile?.profile_pic_url} 
              size={120} 
            />
            <Text style={styles.profileName}>
              {userProfile?.profile_name || 'Unknown'}
            </Text>
            {userProfile?.real_name && (
              <Text style={styles.realName}>
                {userProfile.real_name}
              </Text>
            )}
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                Member since
              </Text>
              <Text style={styles.statLabel}>
                {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal 
        visible={showSettings} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  realName: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  statsSection: {
    padding: 24,
    paddingTop: 0,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
