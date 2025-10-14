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
