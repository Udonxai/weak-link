import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getForegroundApp, checkPermission, getModuleStatus, isNativeModuleAvailable } from '@/modules/UsageStats';
import { supabase } from '@/lib/supabase';

interface AppTrackingDebuggerProps {
  userId: string;
  groupId: string;
}

export default function AppTrackingDebugger({ userId, groupId }: AppTrackingDebuggerProps) {
  const [currentApp, setCurrentApp] = useState<string>('Unknown');
  const [permissionStatus, setPermissionStatus] = useState<string>('Checking...');
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [moduleStatus, setModuleStatus] = useState<any>(null);

  useEffect(() => {
    checkPermissions();
    loadRecentEvents();
    setModuleStatus(getModuleStatus());
  }, []);

  const checkPermissions = async () => {
    try {
      const hasPermission = await checkPermission();
      setPermissionStatus(hasPermission ? 'Granted' : 'Denied');
    } catch (error) {
      setPermissionStatus('Error checking permissions');
    }
  };

  const loadRecentEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', groupId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const testAppDetection = async () => {
    try {
      const app = await getForegroundApp();
      setCurrentApp(app);
    } catch (error) {
      setCurrentApp('Error: ' + error.message);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    const interval = setInterval(async () => {
      await testAppDetection();
    }, 2000);

    // Stop monitoring after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsMonitoring(false);
    }, 30000);
  };

  const refreshEvents = () => {
    loadRecentEvents();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Tracking Debugger</Text>
      
      {/* Permission Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <Text style={[styles.status, permissionStatus === 'Granted' ? styles.success : styles.error]}>
          {permissionStatus}
        </Text>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Current App Detection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current App Detection</Text>
        <Text style={styles.currentApp}>Current App: {currentApp}</Text>
        <TouchableOpacity style={styles.button} onPress={testAppDetection}>
          <Text style={styles.buttonText}>Test Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, isMonitoring && styles.activeButton]} 
          onPress={startMonitoring}
          disabled={isMonitoring}
        >
          <Text style={styles.buttonText}>
            {isMonitoring ? 'Monitoring... (30s)' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshEvents}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {recentEvents.length === 0 ? (
          <Text style={styles.noEvents}>No events found</Text>
        ) : (
          recentEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventApp}>{event.app_name}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.eventUser}>User ID: {event.user_id}</Text>
            </View>
          ))
        )}
      </View>

      {/* Module Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Module Status</Text>
        {moduleStatus && (
          <>
            <Text style={styles.debugText}>Platform: {moduleStatus.platform}</Text>
            <Text style={[styles.debugText, moduleStatus.screenTimeModule ? styles.success : styles.error]}>
              Screen Time Module: {moduleStatus.screenTimeModule ? 'Available' : 'Not Available'}
            </Text>
            <Text style={[styles.debugText, moduleStatus.usageStatsModule ? styles.success : styles.error]}>
              Usage Stats Module: {moduleStatus.usageStatsModule ? 'Available' : 'Not Available'}
            </Text>
            {!moduleStatus.screenTimeModule && (
              <Text style={styles.warningText}>
                ⚠️ Native modules not available. This feature requires a development build.
              </Text>
            )}
          </>
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.debugText}>User ID: {userId}</Text>
        <Text style={styles.debugText}>Group ID: {groupId}</Text>
        <Text style={styles.debugText}>Platform: {require('react-native').Platform.OS}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#FF3B30',
  },
  currentApp: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
  },
  eventItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  eventApp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  eventUser: {
    fontSize: 12,
    color: '#666',
  },
  noEvents: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  debugText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  warningText: {
    fontSize: 14,
    color: '#FFA500',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
