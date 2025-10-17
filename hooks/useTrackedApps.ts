import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TrackedApp {
  id: number;
  group_id: number;
  app_identifier: string;
  app_name: string;
  platform: string;
  created_at: string;
}

interface UseTrackedAppsResult {
  trackedApps: TrackedApp[];
  trackedAppIdentifiers: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrackedApps(groupId: number | null): UseTrackedAppsResult {
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedApps = async () => {
    if (!groupId) {
      setTrackedApps([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tracked_apps')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching tracked apps:', fetchError);
        setError(fetchError.message);
        setTrackedApps([]);
      } else {
        setTrackedApps(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching tracked apps:', err);
      setError('Failed to fetch tracked apps');
      setTrackedApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackedApps();
  }, [groupId]);

  const trackedAppIdentifiers = trackedApps.map(app => app.app_identifier);

  return {
    trackedApps,
    trackedAppIdentifiers,
    loading,
    error,
    refetch: fetchTrackedApps,
  };
}
