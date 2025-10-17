import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { getInstalledApps, InstalledApp } from '../modules/UsageStats';

interface AppSelectorProps {
  selectedApps: string[];
  onAppsChange: (apps: string[]) => void;
  onAppNamesChange?: (appNames: string[]) => void;
}

export default function AppSelector({ selectedApps, onAppsChange, onAppNamesChange }: AppSelectorProps) {
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (Platform.OS === 'web') {
        // For web preview, show some common apps
        const mockApps: InstalledApp[] = [
          { packageName: 'com.instagram.android', appName: 'Instagram' },
          { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
          { packageName: 'com.snapchat.android', appName: 'Snapchat' },
          { packageName: 'com.twitter.android', appName: 'Twitter' },
          { packageName: 'com.facebook.katana', appName: 'Facebook' },
          { packageName: 'com.google.android.youtube', appName: 'YouTube' },
          { packageName: 'com.android.chrome', appName: 'Chrome' },
          { packageName: 'com.apple.mobilesafari', appName: 'Safari' },
        ];
        setInstalledApps(mockApps);
      } else {
        const apps = await getInstalledApps();
        setInstalledApps(apps);
      }
    } catch (err) {
      console.error('Error loading installed apps:', err);
      setError('Failed to load installed apps');
      Alert.alert('Error', 'Failed to load installed apps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (app: InstalledApp) => {
    const isSelected = selectedApps.includes(app.packageName);
    let newSelectedApps: string[];
    let newSelectedAppNames: string[];

    if (isSelected) {
      newSelectedApps = selectedApps.filter(packageName => packageName !== app.packageName);
      newSelectedAppNames = newSelectedApps.map(packageName => {
        const app = installedApps.find(a => a.packageName === packageName);
        return app?.appName || packageName;
      });
    } else {
      newSelectedApps = [...selectedApps, app.packageName];
      newSelectedAppNames = newSelectedApps.map(packageName => {
        const app = installedApps.find(a => a.packageName === packageName);
        return app?.appName || packageName;
      });
    }

    onAppsChange(newSelectedApps);
    if (onAppNamesChange) {
      onAppNamesChange(newSelectedAppNames);
    }
  };

  const renderAppItem = ({ item }: { item: InstalledApp }) => {
    const isSelected = selectedApps.includes(item.packageName);
    
    return (
      <TouchableOpacity
        style={[styles.appItem, isSelected && styles.selectedAppItem]}
        onPress={() => toggleApp(item)}
      >
        <View style={styles.appContent}>
          <Text style={[styles.appName, isSelected && styles.selectedAppName]}>
            {item.appName}
          </Text>
          <Text style={[styles.packageName, isSelected && styles.selectedPackageName]}>
            {item.packageName}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading installed apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInstalledApps}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Apps to Track</Text>
      <Text style={styles.subtitle}>
        Choose the apps that should trigger accountability events when opened
      </Text>
      
      {selectedApps.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      <FlatList
        data={installedApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.packageName}
        style={styles.appList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  selectedCount: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'center',
  },
  appList: {
    flex: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAppItem: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  appContent: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedAppName: {
    color: '#2E7D32',
  },
  packageName: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectedPackageName: {
    color: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
