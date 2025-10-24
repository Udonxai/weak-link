import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Copy, Check, Users, Target, Trash2 } from 'lucide-react-native';
import ProfilePicture from '@/components/ProfilePicture';

interface LeaderboardEntry {
  user_id: number;
  profile_name: string;
  profile_pic_url: string | null;
  losses_count: number;
}

interface GroupDetails {
  id: string;
  name: string;
  invite_code: string;
  created_by: number;
  creator_name: string;
  memberCount: number;
}

export default function GroupDetailScreen() {
  const { group_id } = useLocalSearchParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'apps'>('leaderboard');

  useEffect(() => {
    if (group_id) {
      loadGroupDetails();
    }
  }, [group_id]);

  const loadGroupDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          invite_code,
          created_by,
          users!groups_created_by_fkey (
            profile_name
          )
        `)
        .eq('id', group_id)
        .single();

      if (error) throw error;

      // Get member count
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group_id);

      setGroup({
        id: data.id,
        name: data.name,
        invite_code: data.invite_code,
        created_by: data.created_by,
        creator_name: (data.users as any)?.profile_name || 'Unknown',
        memberCount: count || 0,
      });
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (group) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const deleteGroup = async () => {
    if (!group || !user) return;

    // Show confirmation alert
    const confirmed = await new Promise((resolve) => {
      Alert.alert(
        'Delete Group',
        `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmed) return;

    try {
      // Delete group (this will cascade delete related records due to foreign key constraints)
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id)
        .eq('created_by', parseInt(user.id)); // Only allow creator to delete

      if (error) {
        console.error('Error deleting group:', error);
        Alert.alert('Error', 'Failed to delete group. Please try again.');
        return;
      }

      // Navigate back to groups list
      router.replace('/(tabs)/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      Alert.alert('Error', 'Failed to delete group. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        {user && parseInt(user.id) === group.created_by && (
          <TouchableOpacity style={styles.deleteButton} onPress={deleteGroup}>
            <Trash2 size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
        {(!user || parseInt(user.id) !== group.created_by) && <View style={styles.headerSpacer} />}
      </View>

      {/* Group Info Section */}
      <View style={styles.groupInfoSection}>
        <View style={styles.groupInfoCard}>
          <View style={styles.groupInfoRow}>
            <Text style={styles.groupInfoLabel}>Created by:</Text>
            <Text style={styles.groupInfoValue}>{group.creator_name}</Text>
          </View>
          <View style={styles.groupInfoRow}>
            <Text style={styles.groupInfoLabel}>Members:</Text>
            <Text style={styles.groupInfoValue}>{group.memberCount}</Text>
          </View>
          <View style={styles.groupInfoRow}>
            <Text style={styles.groupInfoLabel}>Invite Code:</Text>
            <View style={styles.inviteCodeRow}>
              <Text style={styles.inviteCode}>{group.invite_code}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyInviteCode}>
                {copiedCode ? (
                  <Check size={20} color="#00C853" />
                ) : (
                  <Copy size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Target size={20} color={activeTab === 'leaderboard' ? '#007AFF' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'apps' && styles.activeTab]}
          onPress={() => setActiveTab('apps')}
        >
          <Users size={20} color={activeTab === 'apps' ? '#007AFF' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'apps' && styles.activeTabText]}>
            Tracked Apps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 'leaderboard' ? (
          <GroupLeaderboard groupId={group_id as string} />
        ) : (
          <TrackedApps groupId={group_id as string} />
        )}
      </View>
    </View>
  );
}


// Full leaderboard component
function GroupLeaderboard({ groupId }: { groupId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [groupId]);

  const loadLeaderboard = async () => {
    try {
      // Get all group members
      const { data: membersData } = await supabase
        .from('group_members')
        .select(`
          user_id,
          users!inner (
            id,
            profile_name,
            profile_pic_url
          )
        `)
        .eq('group_id', groupId);

      if (!membersData) return;

      // Get loss counts for each member from monthly_stats (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const leaderboardEntries = await Promise.all(
        membersData.map(async (member: any) => {
          const { data: statsData } = await supabase
            .from('monthly_stats')
            .select('losses_count')
            .eq('user_id', member.user_id)
            .eq('group_id', groupId)
            .eq('month_start', `${currentMonth}-01`)
            .maybeSingle();

          return {
            user_id: member.user_id,
            profile_name: member.users.profile_name,
            profile_pic_url: member.users.profile_pic_url,
            losses_count: statsData?.losses_count || 0,
          };
        })
      );

      // Sort by losses_count (ascending - least losses first)
      leaderboardEntries.sort((a, b) => a.losses_count - b.losses_count);
      setLeaderboard(leaderboardEntries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.leaderboardContainer}>
      <Text style={styles.leaderboardHeader}>Current Month Leaderboard</Text>
      {leaderboard.length === 0 ? (
        <View style={styles.emptyLeaderboard}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      ) : (
        leaderboard.map((entry, index) => (
          <View key={`${entry.user_id}-${index}`} style={styles.leaderboardRow}>
            {/* Ranking number outside the block */}
            <Text style={[
              styles.rankNumber,
              index === 0 && styles.firstPlace,
              index === 1 && styles.secondPlace,
              index === 2 && styles.thirdPlace,
            ]}>
              {index + 1}.
            </Text>

            {/* User block */}
            <View style={styles.leaderboardEntry}>
              {/* Profile Picture */}
              <View style={styles.profilePictureContainer}>
                <ProfilePicture 
                  profilePicUrl={entry.profile_pic_url} 
                  size={40}
                />
              </View>

              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>{entry.profile_name}</Text>
                <Text style={styles.leaderboardStats}>
                  {entry.losses_count === 0 ? 'Perfect streak! 🏆' : `${entry.losses_count} loss${entry.losses_count === 1 ? '' : 'es'}`}
                </Text>
              </View>
              <View style={styles.leaderboardScore}>
                <Text style={styles.scoreText}>{entry.losses_count}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function TrackedApps({ groupId }: { groupId: string }) {
  const [trackedApps, setTrackedApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackedApps();
  }, [groupId]);

  const loadTrackedApps = async () => {
    try {
      const { data, error } = await supabase
        .from('tracked_apps')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTrackedApps(data || []);
    } catch (error) {
      console.error('Error loading tracked apps:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.trackedAppsContainer}>
      <Text style={styles.trackedAppsHeader}>Tracked Apps</Text>
      {trackedApps.length === 0 ? (
        <View style={styles.emptyTrackedApps}>
          <Text style={styles.emptyText}>No apps being tracked</Text>
          <Text style={styles.emptySubtext}>Apps will appear here once they're added to this group</Text>
        </View>
      ) : (
        trackedApps.map((app) => (
          <View key={app.id} style={styles.trackedAppCard}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{app.app_name}</Text>
              <Text style={styles.appIdentifier}>{app.app_identifier}</Text>
              <Text style={styles.appPlatform}>
                {app.platform === 'ios' ? '📱 iOS' : '🤖 Android'}
              </Text>
            </View>
            <View style={styles.appStatus}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  deleteButton: {
    padding: 8,
  },
  groupInfoSection: {
    padding: 24,
  },
  groupInfoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  groupInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupInfoLabel: {
    fontSize: 14,
    color: '#999',
  },
  groupInfoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteCode: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  // Leaderboard styles
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaderboardEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    width: 30,
    textAlign: 'center',
    marginRight: 12,
  },
  firstPlace: {
    color: '#FFD700',
  },
  secondPlace: {
    color: '#C0C0C0',
  },
  thirdPlace: {
    color: '#CD7F32',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  leaderboardStats: {
    fontSize: 14,
    color: '#999',
  },
  leaderboardScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  emptyLeaderboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  // Tracked Apps styles
  trackedAppsContainer: {
    flex: 1,
  },
  trackedAppsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  trackedAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  appIdentifier: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  appPlatform: {
    fontSize: 12,
    color: '#007AFF',
  },
  appStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '600',
  },
  emptyTrackedApps: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  // Profile picture styles for leaderboard
  profilePictureContainer: {
    marginRight: 16,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultProfilePicture: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileEmoji: {
    fontSize: 20,
  },
});
