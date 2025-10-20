import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator, Platform, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Users, Copy, Check, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import AppSelector from '@/components/AppSelector';
import { requestPermission as requestScreenTimePermission, checkPermission as checkScreenTimePermission } from '@/modules/UsageStats';

interface LeaderboardEntry {
  user_id: number;
  profile_name: string;
  profile_pic_url: string | null;
  losses_count: number;
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
  memberCount: number;
  leaderboard: LeaderboardEntry[];
}

export default function GroupsScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  // App selection state
  const [createStep, setCreateStep] = useState<'name' | 'apps'>('name');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedAppNames, setSelectedAppNames] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadGroups();
    } else {
      // If no user, stop loading
      setLoading(false);
    }
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (
          id,
          name,
          invite_code
        )
      `)
      .eq('user_id', user.id);

    if (data) {
      const groupsWithCounts = await Promise.all(
        data.map(async (gm: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', gm.group_id);

          // Fetch leaderboard data for this group
          const { data: leaderboardData } = await supabase
            .from('group_members')
            .select(`
              user_id,
              users!inner (
                id,
                profile_name,
                profile_pic_url
              )
            `)
            .eq('group_id', gm.group_id);

          // Get loss counts for each member from monthly_stats (current month)
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
          const leaderboardEntries = await Promise.all(
            (leaderboardData || []).map(async (member: any) => {
              const { data: statsData } = await supabase
                .from('monthly_stats')
                .select('losses_count')
                .eq('user_id', member.user_id)
                .eq('group_id', gm.group_id)
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

          return {
            id: gm.groups.id,
            name: gm.groups.name,
            invite_code: gm.groups.invite_code,
            memberCount: count || 0,
            leaderboard: leaderboardEntries,
          };
        })
      );
      setGroups(groupsWithCounts);
    }

    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) {
      setError('Please enter a group name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const { data, error: createError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Group creation error:', createError);
        setError(createError.message);
        setCreating(false);
        return;
      }

      console.log('Group created successfully:', data);
    
      // Add creator as a member of the new group
      const { error: memberInsertError } = await supabase
        .from('group_members')
        .insert({
          user_id: user.id,
          group_id: data.id,
        });
      
      if (memberInsertError) {
        console.error('Failed to add creator to group_members:', memberInsertError);
        setError(memberInsertError.message);
        setCreating(false);
        return;
      }

      // Insert tracked apps if any are selected
      if (selectedApps.length > 0) {
        const trackedAppsData = selectedApps.map((appIdentifier, index) => ({
          group_id: data.id,
          app_identifier: appIdentifier,
          app_name: selectedAppNames[index] || appIdentifier,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        }));

        const { error: appsInsertError } = await supabase
          .from('tracked_apps')
          .insert(trackedAppsData);

        if (appsInsertError) {
          console.error('Failed to insert tracked apps:', appsInsertError);
          // Don't fail the group creation if app insertion fails
        }
      }
      
      // Clear form and close modal
      setNewGroupName('');
      setSelectedApps([]);
      setSelectedAppNames([]);
      setCreateStep('name');
      setShowCreateModal(false);
      setCreating(false);
      
      // Reload groups to show the new group
      await loadGroups();
      
    } catch (err) {
      console.error('Unexpected error creating group:', err);
      setError('Failed to create group. Please try again.');
      setCreating(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim() || !user) {
      setError('Please enter an invite code');
      return;
    }

    setCreating(true);
    setError('');

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', joinCode.trim())
      .maybeSingle();

    if (groupError || !groupData) {
      setError('Invalid invite code');
      setCreating(false);
      return;
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        user_id: user.id,
        group_id: groupData.id,
      });

    if (joinError) {
      setError(joinError.message);
      setCreating(false);
    } else {
      setJoinCode('');
      setShowJoinModal(false);
      setCreating(false);
      loadGroups();
    }
  };

  const copyInviteCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowJoinModal(true)}>
            <Text style={styles.headerButtonText}>Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#333" />
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>Create a group or join one with an invite code</Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity 
              key={group.id} 
              style={styles.groupCard}
              onPress={() => router.push(`/groups/${group.id}`)}
            >
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>{group.memberCount} members</Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent navigation when copying
                  copyInviteCode(group.invite_code);
                }}
              >
                {copiedCode === group.invite_code ? (
                  <Check size={20} color="#00C853" />
                ) : (
                  <Copy size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.inviteCode}>{group.invite_code}</Text>
              
              {/* Mini Leaderboard */}
              {group.leaderboard.length > 0 && (
                <View style={styles.leaderboardSection}>
                  <Text style={styles.leaderboardTitle}>Top Performers</Text>
                  <View style={styles.leaderboardList}>
                    {group.leaderboard.slice(0, 3).map((entry, index) => (
                      <View key={`${entry.user_id}-${index}`} style={styles.leaderboardEntry}>
                        <View style={styles.leaderboardRank}>
                          <Text style={styles.rankNumber}>{index + 1}</Text>
                        </View>
                        <View style={styles.leaderboardInfo}>
                          <Text style={styles.leaderboardName}>{entry.profile_name}</Text>
                          <Text style={styles.leaderboardStats}>
                            {entry.losses_count === 0 ? 'Perfect!' : `${entry.losses_count} loss${entry.losses_count === 1 ? '' : 'es'}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, createStep === 'apps' && styles.fullScreenModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {createStep === 'name' ? 'Create Group' : 'Select Apps to Track'}
              </Text>
              {createStep === 'apps' && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCreateStep('name')}
                  disabled={creating}
                >
                  <ArrowLeft size={20} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            {createStep === 'name' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Group name"
                  placeholderTextColor="#999"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  editable={!creating}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowCreateModal(false);
                      setNewGroupName('');
                      setError('');
                      setCreateStep('name');
                      setSelectedApps([]);
                      setSelectedAppNames([]);
                    }}
                    disabled={creating}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, creating && styles.buttonDisabled]}
                    onPress={async () => {
                      if (Platform.OS === 'ios') {
                        try {
                          const hasPermission = await checkScreenTimePermission();
                          if (!hasPermission) {
                            const granted = await requestScreenTimePermission();
                            if (!granted) {
                              Alert.alert('Permission Required', 'Screen Time permission is needed to select apps on iOS.');
                              return;
                            }
                          }
                        } catch (e) {
                          // Non-fatal; allow proceeding for selection UI
                        }
                      }
                      setCreateStep('apps');
                    }}
                    disabled={creating || !newGroupName.trim()}
                  >
                    <Text style={styles.createButtonText}>Next</Text>
                    <ArrowRight size={16} color="#fff" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.appSelectorContainer}>
                  <AppSelector
                    selectedApps={selectedApps}
                    onAppsChange={setSelectedApps}
                    onAppNamesChange={setSelectedAppNames}
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowCreateModal(false);
                      setNewGroupName('');
                      setError('');
                      setCreateStep('name');
                      setSelectedApps([]);
                      setSelectedAppNames([]);
                    }}
                    disabled={creating}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createButton, creating && styles.buttonDisabled]}
                    onPress={createGroup}
                    disabled={creating}
                  >
                    <Text style={styles.createButtonText}>{creating ? 'Creating...' : 'Create Group'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Group</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Invite code"
              placeholderTextColor="#999"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="none"
              editable={!creating}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setError('');
                }}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, creating && styles.buttonDisabled]}
                onPress={joinGroup}
                disabled={creating}
              >
                <Text style={styles.createButtonText}>{creating ? 'Joining...' : 'Join'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  groupCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  groupInfo: {
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#999',
  },
  copyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  inviteCode: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '80%',
  },
  fullScreenModal: {
    maxHeight: '90%',
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  appSelectorContainer: {
    flex: 1,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: '#ff4444',
    marginBottom: 12,
    fontSize: 14,
  },
  leaderboardSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  leaderboardRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  leaderboardStats: {
    fontSize: 12,
    color: '#999',
  },
});
