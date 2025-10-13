import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotifications } from './useNotifications';

interface RealtimeEvent {
  id: string;
  user_id: string;
  group_id: string;
  app_name: string;
  app_identifier: string;
  timestamp: string;
}

interface UseRealtimeEventsConfig {
  groupId: string | null;
  userId: string;
  enabled: boolean;
}

export function useRealtimeEvents(config: UseRealtimeEventsConfig) {
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(null);
  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    if (!config.enabled || !config.groupId) {
      return;
    }

    const channel = supabase
      .channel(`events:${config.groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `group_id=eq.${config.groupId}`,
        },
        async (payload) => {
          const event = payload.new as RealtimeEvent;
          setLatestEvent(event);

          if (event.user_id !== config.userId) {
            const { data: userData } = await supabase
              .from('users')
              .select('username')
              .eq('id', event.user_id)
              .maybeSingle();

            const username = userData?.username || 'Someone';

            await sendLocalNotification(
              'Weak Link Alert',
              `${username} opened ${event.app_name}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config.enabled, config.groupId, config.userId]);

  return { latestEvent };
}
