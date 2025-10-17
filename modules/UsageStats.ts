import { NativeModules, Platform } from 'react-native';

const { UsageStatsModule, ScreenTimeModule } = NativeModules;

export async function getForegroundApp(): Promise<string> {
  if (Platform.OS === 'android') {
    if (!UsageStatsModule) {
      throw new Error('UsageStatsModule not available');
    }
    return await UsageStatsModule.getForegroundApp();
  } else if (Platform.OS === 'ios') {
    return 'unknown';
  }
  return 'unknown';
}

export async function checkPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (!UsageStatsModule) {
      return false;
    }
    return await UsageStatsModule.checkPermission();
  } else if (Platform.OS === 'ios') {
    if (!ScreenTimeModule) {
      return false;
    }
    return await ScreenTimeModule.checkPermission();
  }
  return false;
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    if (!ScreenTimeModule) {
      throw new Error('ScreenTimeModule not available');
    }
    return await ScreenTimeModule.requestPermission();
  }
  return false;
}

export async function startMonitoring(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    if (!ScreenTimeModule) {
      throw new Error('ScreenTimeModule not available');
    }
    return await ScreenTimeModule.startMonitoring();
  }
  return false;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
}

export async function getInstalledApps(): Promise<InstalledApp[]> {
  if (Platform.OS === 'android') {
    if (!UsageStatsModule) {
      throw new Error('UsageStatsModule not available');
    }
    return await UsageStatsModule.getInstalledApps();
  } else if (Platform.OS === 'ios') {
    // FamilyControls does not provide a public API to enumerate all installed apps.
    // Provide a curated list of common apps by bundle id for selection.
    const curatedApps: InstalledApp[] = [
      { packageName: 'com.burbn.instagram', appName: 'Instagram' },
      { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
      { packageName: 'com.toyopagroup.picaboo', appName: 'Snapchat' },
      { packageName: 'com.atebits.Tweetie2', appName: 'Twitter' },
      { packageName: 'com.facebook.Facebook', appName: 'Facebook' },
      { packageName: 'com.google.ios.youtube', appName: 'YouTube' },
      { packageName: 'com.apple.mobilesafari', appName: 'Safari' },
      { packageName: 'com.google.Chrome.ios', appName: 'Chrome' },
      { packageName: 'com.reddit.Reddit', appName: 'Reddit' },
      { packageName: 'com.discord', appName: 'Discord' },
      { packageName: 'com.spotify.client', appName: 'Spotify' },
      { packageName: 'com.netflix.Netflix', appName: 'Netflix' },
    ];
    return curatedApps;
  }
  return [];
}