import { useEffect, useState, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { getForegroundApp } from '@/modules/UsageStats';
import { supabase } from '@/lib/supabase';

interface AppWatcherConfig {
  userId: string;
  groupId: string;
  trackedApps: string[];
  enabled: boolean;
}

export function useAppWatcher(config: AppWatcherConfig) {
  const [currentApp, setCurrentApp] = useState<string>('');
  const [lastDetectedApp, setLastDetectedApp] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!config.enabled || config.trackedApps.length === 0) {
      return;
    }

    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState;
    });

    const checkApp = async () => {
      if (appStateRef.current !== 'active') {
        return;
      }

      try {
        const app = await getForegroundApp();
        setCurrentApp(app);

        if (
          config.trackedApps.includes(app) &&
          app !== lastDetectedApp &&
          app !== 'unknown'
        ) {
          setLastDetectedApp(app);

          await supabase.from('events').insert({
            user_id: config.userId,
            group_id: config.groupId,
            app_name: getAppName(app),
            app_identifier: app,
          });
        }
      } catch (error) {
        console.error('Error checking app:', error);
      }
    };

    intervalRef.current = setInterval(checkApp, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [config.enabled, config.trackedApps, config.userId, config.groupId, lastDetectedApp]);

  return { currentApp };
}

function getAppName(identifier: string): string {
  const appNames: Record<string, string> = {
    'com.instagram.android': 'Instagram',
    'com.zhiliaoapp.musically': 'TikTok',
    'com.snapchat.android': 'Snapchat',
    'com.twitter.android': 'Twitter',
    'com.facebook.katana': 'Facebook',
    'com.google.android.youtube': 'YouTube',
    'com.android.chrome': 'Chrome',
    'com.apple.mobilesafari': 'Safari',
    'com.burbn.instagram': 'Instagram',
    'com.atebits.Tweetie2': 'Twitter',
    'com.toyopagroup.picaboo': 'Snapchat',
  };

  return appNames[identifier] || identifier;
}
