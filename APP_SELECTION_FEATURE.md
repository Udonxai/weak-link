# App Selection Feature

This feature allows users to select specific apps from their device when creating a new group, and automatically inserts those apps into the `tracked_apps` table in the database.

## Overview

When creating a new group, users now go through a two-step process:
1. **Step 1**: Enter the group name
2. **Step 2**: Select apps from their device to track

## Implementation Details

### 1. Native Module Extension (Android)

**File**: `android/app/src/main/java/com/weaklink/UsageStatsModule.java`

Added a new method `getInstalledApps()` that:
- Gets a list of all installed applications on the device
- Filters out system apps (only shows user-installed apps)
- Returns app package names and display names
- Uses `PackageManager` to get app information

### 2. UsageStats Module Update

**File**: `modules/UsageStats.ts`

Added:
- `InstalledApp` interface for type safety
- `getInstalledApps()` function that calls the native module
- Web fallback with mock apps for development

### 3. App Selection Component

**File**: `components/AppSelector.tsx`

A reusable component that:
- Displays a searchable list of installed apps
- Allows multi-selection with checkboxes
- Shows app names and package identifiers
- Provides loading and error states
- Works on both native and web platforms

### 4. Group Creation Flow Update

**File**: `app/(tabs)/groups.tsx`

Modified the group creation modal to:
- Support multi-step flow (name → app selection)
- Store selected apps and their names
- Insert tracked apps into database after group creation
- Handle platform-specific app identifiers (iOS/Android)

### 5. Database Integration

**File**: `hooks/useTrackedApps.ts`

New hook that:
- Fetches tracked apps for a specific group
- Provides loading and error states
- Returns both full app data and identifiers array

### 6. App Watcher Enhancement

**File**: `hooks/useAppWatcher.ts`

Updated to:
- Accept tracked apps from database instead of hardcoded list
- Use actual app names from the database
- Support dynamic app lists per group

## Database Schema

The `tracked_apps` table stores:
- `group_id`: Which group tracks this app
- `app_identifier`: Package name or bundle ID
- `app_name`: Display name of the app
- `platform`: "android", "ios", or "both"
- `created_at`: When the app was added to tracking

## Usage Example

```typescript
// In a component that needs app watching
import { useTrackedApps } from '@/hooks/useTrackedApps';
import { useAppWatcher } from '@/hooks/useAppWatcher';

function MyComponent({ groupId }: { groupId: number }) {
  const { user } = useAuth();
  const { trackedApps } = useTrackedApps(groupId);
  
  const trackedAppsForWatcher = trackedApps.map(app => ({
    app_identifier: app.app_identifier,
    app_name: app.app_name,
  }));

  useAppWatcher({
    userId: user?.id?.toString() || '',
    groupId: groupId.toString(),
    trackedApps: trackedAppsForWatcher,
    enabled: true,
  });

  return <div>App watching is active</div>;
}
```

## Platform Support

### Android
- Uses `PackageManager` to get installed apps
- Requires `UsageStats` permission for app detection
- Filters out system apps automatically

### iOS
- Currently returns empty array (needs ScreenTime framework implementation)
- Mock data provided for web development

### Web
- Shows mock apps for development/testing
- Full UI functionality available
- No actual app detection (as expected)

## Security Considerations

- Only user-installed apps are shown (system apps filtered out)
- App selection is per-group (users can't see other groups' tracked apps)
- Database has proper foreign key constraints and RLS policies

## Future Enhancements

1. **iOS Implementation**: Add ScreenTime framework integration
2. **App Categories**: Group apps by category (Social, Games, etc.)
3. **Search/Filter**: Add search functionality to app selector
4. **App Icons**: Display app icons in the selection list
5. **Batch Operations**: Allow adding/removing multiple apps at once
6. **App Usage Stats**: Show usage statistics for tracked apps

## Testing

To test the feature:

1. **Web Development**: 
   - Create a group and select mock apps
   - Verify apps are inserted into database

2. **Android Testing**:
   - Build and install the app on a device
   - Grant Usage Stats permission
   - Create a group and select real apps
   - Verify app detection works

3. **Database Verification**:
   - Check `tracked_apps` table after group creation
   - Verify `events` table gets populated when tracked apps are opened
