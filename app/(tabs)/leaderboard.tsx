import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trophy, TrendingUp, Calendar } from 'lucide-react-native';

interface LeaderboardEntry {
  user_id: string;
  profile_name: string;
  breaks: number;
  isCurrentUser: boolean;
  group_id: string;
  group_name: string;
}

interface Group {
  id: string;
  name: string;
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGroups();
    } else {
      // If no user, stop loading
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (groups.length > 0) {
      loadLeaderboard();
    }
  }, [groups, period]);

  const loadGroups = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      const groupList = data.map((gm: any) => ({
        id: gm.groups.id,
        name: gm.groups.name,
      }));
      setGroups(groupList);
    }

    setLoading(false);
  };

  const loadLeaderboard = async () => {
    if (!user) return;

    const now = new Date();
    let startDate: Date;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all members from all groups the user is part of
    const { data: members } = await supabase
      .from('group_members')
      .select(`
        user_id,
        group_id,
        users (
          profile_name
        ),
        groups (
          name
        )
      `)
      .in('group_id', groups.map(g => g.id));

    if (!members) return;

    // Get all events from all groups the user is part of
    const { data: events } = await supabase
      .from('events')
      .select('user_id, group_id')
      .in('group_id', groups.map(g => g.id))
      .gte('timestamp', startDate.toISOString());

    const leaderboardData: LeaderboardEntry[] = members.map((member: any) => {
      const breaks = events?.filter(e => e.user_id === member.user_id && e.group_id === member.group_id).length || 0;
      return {
        user_id: member.user_id,
        profile_name: member.users.profile_name,
        breaks,
        isCurrentUser: member.user_id === user.id,
        group_id: member.group_id,
        group_name: member.groups.name,
      };
    });

    leaderboardData.sort((a, b) => a.breaks - b.breaks);

    setLeaderboard(leaderboardData);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Trophy size={64} color="#333" />
        <Text style={styles.emptyText}>No groups yet</Text>
        <Text style={styles.emptySubtext}>Join a group to see the leaderboard</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
          onPress={() => setPeriod('today')}
        >
          <Text style={[styles.periodText, period === 'today' && styles.periodTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>This Week</Text>
        </TouchableOpacity>
      </View>


      <ScrollView style={styles.leaderboardContainer}>
        {leaderboard.map((entry, index) => (
          <View
            key={entry.user_id}
            style={[
              styles.entryCard,
              entry.isCurrentUser && styles.entryCardHighlight,
              index === 0 && styles.entryCardFirst,
            ]}
          >
            <View style={styles.entryRank}>
              {index === 0 ? (
                <Trophy size={24} color="#FFD700" />
              ) : (
                <Text style={styles.rankText}>#{index + 1}</Text>
              )}
            </View>
            <View style={styles.entryInfo}>
              <Text style={[styles.entryUsername, entry.isCurrentUser && styles.entryUsernameHighlight]}>
                {entry.profile_name}
                {entry.isCurrentUser ? ' (You)' : ''}
              </Text>
              <Text style={styles.entryGroup}>
                {entry.group_name}
              </Text>
              <Text style={styles.entryBreaks}>
                {entry.breaks} {entry.breaks === 1 ? 'break' : 'breaks'}
              </Text>
            </View>
            {index === leaderboard.length - 1 && leaderboard.length > 1 && (
              <View style={styles.weakLinkBadge}>
                <Text style={styles.weakLinkText}>Weak Link</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },
  leaderboardContainer: {
    flex: 1,
    padding: 24,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  entryCardHighlight: {
    borderColor: '#007AFF',
    backgroundColor: '#0a1929',
  },
  entryCardFirst: {
    borderColor: '#FFD700',
  },
  entryRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entryUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  entryUsernameHighlight: {
    color: '#007AFF',
  },
  entryGroup: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  entryBreaks: {
    fontSize: 14,
    color: '#999',
  },
  weakLinkBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weakLinkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
