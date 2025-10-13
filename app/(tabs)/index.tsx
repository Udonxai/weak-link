import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Shield, TrendingDown } from 'lucide-react-native';

interface GroupWithMembers {
  id: string;
  name: string;
  memberCount: number;
}

interface TodayStats {
  totalBreaks: number;
  yourBreaks: number;
  cleanStreak: boolean;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [stats, setStats] = useState<TodayStats>({ totalBreaks: 0, yourBreaks: 0, cleanStreak: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: groupsData } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (groupsData) {
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (gm: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', gm.group_id);

          return {
            id: gm.groups.id,
            name: gm.groups.name,
            memberCount: count || 0,
          };
        })
      );
      setGroups(groupsWithCounts);
    }

    const { data: eventsData } = await supabase
      .from('events')
      .select('user_id')
      .gte('timestamp', today.toISOString());

    if (eventsData) {
      const yourBreaks = eventsData.filter(e => e.user_id === user.id).length;
      setStats({
        totalBreaks: eventsData.length,
        yourBreaks,
        cleanStreak: yourBreaks === 0,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weak Link</Text>
        <Text style={styles.subtitle}>Stay strong, stay accountable</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, stats.cleanStreak && styles.statCardSuccess]}>
          <Shield size={32} color={stats.cleanStreak ? '#00C853' : '#666'} />
          <Text style={styles.statValue}>{stats.cleanStreak ? 'Clean' : 'Broken'}</Text>
          <Text style={styles.statLabel}>Today's Streak</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingDown size={32} color="#007AFF" />
          <Text style={styles.statValue}>{stats.yourBreaks}</Text>
          <Text style={styles.statLabel}>Your Breaks</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Groups</Text>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>Create or join a group to get started</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.id} style={styles.groupCard}>
              <View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>{group.memberCount} members</Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statCardSuccess: {
    borderColor: '#00C853',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: '#999',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
