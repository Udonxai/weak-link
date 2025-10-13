# Weak Link - Social Accountability App

A cross-platform mobile app built with Expo and React Native that tracks when users open specified distraction apps and notifies their friend groups in real-time. Friends compete to avoid being the "weak link" — the first person to open a distraction app each day.

## Features

- User authentication with Supabase
- Create and join accountability groups
- Real-time leaderboard tracking
- Push notifications when group members open distraction apps
- Native app tracking for Android and iOS
- Daily and weekly statistics

## Tech Stack

- **Frontend**: Expo (React Native, TypeScript)
- **Database/Backend**: Supabase (Auth, Realtime, PostgreSQL)
- **Notifications**: Expo Notifications + Supabase Realtime
- **Native APIs**:
  - Android: UsageStatsManager API
  - iOS: Screen Time API (FamilyControls, DeviceActivity, ManagedSettings)

## Project Structure

```
project/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home dashboard
│   │   ├── groups.tsx       # Group management
│   │   ├── leaderboard.tsx  # Leaderboard view
│   │   └── settings.tsx     # Settings
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── android/                  # Android native modules
│   └── app/src/main/java/com/weaklink/
│       ├── UsageStatsModule.java
│       └── UsageStatsPackage.java
├── ios/                      # iOS native modules
│   └── WeakLink/
│       ├── ScreenTimeModule.swift
│       └── ScreenTimeModule.m
├── contexts/                 # React contexts
│   └── AuthContext.tsx
├── hooks/                    # Custom hooks
│   ├── useAppWatcher.ts
│   ├── useNotifications.ts
│   └── useRealtimeEvents.ts
├── lib/                      # Utilities
│   └── supabase.ts
├── modules/                  # Native module bridges
│   └── UsageStats.ts
└── types/                    # TypeScript types
    └── database.ts
```

## Database Schema

### Tables

- **users**: User profiles (extends Supabase auth.users)
- **groups**: Friend groups for accountability
- **group_members**: Junction table for users in groups
- **tracked_apps**: Apps being monitored per group
- **events**: Logs when users open tracked apps

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Web Preview (Current Setup)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open in your browser

**Note**: The web preview provides full UI functionality including authentication, group management, and leaderboards. However, native app tracking features require a physical device build.

### Native Build Setup (Required for App Tracking)

To enable app tracking functionality, you'll need to export this project and build it locally:

#### 1. Export the Project

You cannot build native features directly in the browser environment. Export this project to your local machine:

- Download or clone this project
- Open in your preferred IDE (VS Code, Cursor, etc.)

#### 2. Android Setup

Add the UsageStats permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

Register the native module in `android/app/src/main/java/com/weaklink/MainApplication.java`:

```java
import com.weaklink.UsageStatsPackage;

@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new UsageStatsPackage());
  return packages;
}
```

Build and run:
```bash
npx expo run:android
```

Users will need to grant "Usage Access" permission in Settings > Special Access > Usage Access.

#### 3. iOS Setup

Add capabilities to `ios/WeakLink/WeakLink.entitlements`:

```xml
<key>com.apple.developer.family-controls</key>
<true/>
```

Update `ios/Podfile`:

```ruby
target 'WeakLink' do
  # ... existing config
  pod 'FamilyControls'
end
```

Install pods:
```bash
cd ios && pod install && cd ..
```

Build and run:
```bash
npx expo run:ios
```

Users will need to grant Screen Time permissions when prompted.

## Usage

### 1. Create an Account

Sign up with email and password. Your profile is automatically created.

### 2. Create or Join a Group

- Create a new group from the Groups tab
- Share the invite code with friends
- Or join an existing group using an invite code

### 3. Enable App Tracking (Native Build Only)

On native builds:
- Grant Usage Stats permission (Android) or Screen Time permission (iOS)
- The app will automatically detect when you open tracked apps
- Events are logged in real-time to the database

### 4. Compete with Friends

- View the leaderboard to see who has the fewest breaks
- Get notified when group members open distraction apps
- The person with the most breaks is the "weak link"

## Environment Variables

The project uses Supabase for backend services. Environment variables are configured in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Tracked Apps

The following apps are tracked by default:

**Android**:
- Instagram (`com.instagram.android`)
- TikTok (`com.zhiliaoapp.musically`)
- Snapchat (`com.snapchat.android`)
- Twitter (`com.twitter.android`)
- Facebook (`com.facebook.katana`)
- YouTube (`com.google.android.youtube`)
- Chrome (`com.android.chrome`)

**iOS**:
- Instagram (`com.burbn.instagram`)
- Safari (`com.apple.mobilesafari`)
- Twitter (`com.atebits.Tweetie2`)
- Snapchat (`com.toyopagroup.picaboo`)

You can modify the tracked apps list in `hooks/useAppWatcher.ts`.

## Development

### Adding New Tracked Apps

Edit the `getAppName` function in `hooks/useAppWatcher.ts`:

```typescript
const appNames: Record<string, string> = {
  'com.example.app': 'App Name',
  // ... add more apps
};
```

### Testing Realtime Features

Realtime notifications work in the web preview but are most effective on physical devices with push notification support.

## Troubleshooting

### Android: "Usage Stats permission not granted"

1. Go to Settings > Apps > Special Access > Usage Access
2. Enable access for Weak Link

### iOS: "Screen Time permission denied"

1. Go to Settings > Screen Time > Family Controls
2. Grant permission to Weak Link

### Notifications not working

1. Ensure notification permissions are granted
2. Check that your device allows notifications from the app
3. On Android, verify the notification channel is created

## License

MIT

## Contributing

This is an MVP built for educational purposes. Feel free to fork and extend!
