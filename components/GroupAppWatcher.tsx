import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppWatcher } from '@/hooks/useAppWatcher';
import { useTrackedApps } from '@/hooks/useTrackedApps';
import { useAuth } from '@/contexts/AuthContext';

interface GroupAppWatcherProps {
  groupId: number;
  enabled?: boolean;
}

export default function GroupAppWatcher({ groupId, enabled = true }: GroupAppWatcherProps) {
  const { user } = useAuth();
  const { trackedApps, loading, error } = useTrackedApps(groupId);

  // Convert tracked apps to the format expected by useAppWatcher
  const trackedAppsForWatcher = trackedApps.map(app => ({
    app_identifier: app.app_identifier,
    app_name: app.app_name,
  }));

  const { currentApp } = useAppWatcher({
    userId: user?.id?.toString() || '',
    groupId: groupId.toString(),
    trackedApps: trackedAppsForWatcher,
    enabled: enabled && trackedApps.length > 0,
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading tracked apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (trackedApps.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No apps are being tracked for this group.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Watcher Active</Text>
      <Text style={styles.text}>
        Tracking {trackedApps.length} app{trackedApps.length !== 1 ? 's' : ''}
      </Text>
      {currentApp && (
        <Text style={styles.currentAppText}>
          Current app: {currentApp}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  currentAppText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});
