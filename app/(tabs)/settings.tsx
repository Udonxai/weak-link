import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { LogOut, User, Bell, Shield } from 'lucide-react-native';
import { requestPermission as requestScreenTimePermission, checkPermission as checkScreenTimePermission, startMonitoring as startScreenTimeMonitoring } from '@/modules/UsageStats';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleIOSPermissions = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Permissions', 'iOS Screen Time permissions are only available on iOS devices.');
      return;
    }

    try {
      const hasPermission = await checkScreenTimePermission();
      if (!hasPermission) {
        const granted = await requestScreenTimePermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Screen Time permission is needed to monitor app usage.');
          return;
        }
      }

      // Try to start monitoring schedule
      await startScreenTimeMonitoring();
      Alert.alert('Permissions', 'Screen Time permission granted and monitoring scheduled.');
    } catch (e) {
      Alert.alert('Error', 'Failed to configure Screen Time permissions.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.settingCard}>
            <User size={20} color="#007AFF" />
            <Text style={styles.settingText}>Profile</Text>
          </View>

          <View style={styles.settingCard}>
            <Bell size={20} color="#007AFF" />
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingSubtext}>Coming soon</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Monitoring</Text>

          <TouchableOpacity style={styles.settingCard} onPress={handleIOSPermissions}>
            <Shield size={20} color="#007AFF" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Permissions</Text>
              <Text style={styles.settingSubtext}>Manage app tracking permissions</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              To enable app tracking, you'll need to export this project and build it locally with the native modules configured.
            </Text>
            <Text style={[styles.infoText, {marginTop: 12}]}>
              See the project documentation for Android and iOS setup instructions.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ff4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  settingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    marginLeft: 12,
  },
});
