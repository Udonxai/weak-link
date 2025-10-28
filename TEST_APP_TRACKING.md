# App Tracking Feature Test Guide

## 🎯 Test Objectives
Verify that the app correctly tracks when users open specified apps and notifies group members in real-time.

## 📱 Prerequisites
- [ ] Native build running on physical device (not simulator)
- [ ] At least 2 users in the same group
- [ ] Permissions granted (Usage Access on Android, Screen Time on iOS)
- [ ] Stable internet connection

## 🧪 Test Cases

### Test 1: Permission Setup
**Objective**: Verify app can request and receive necessary permissions

**Steps**:
1. Open the app
2. Navigate to Settings
3. Look for "App Tracking" or "Usage Stats" option
4. Tap to enable tracking
5. Grant permission when prompted by system

**Expected Result**: 
- Permission status shows "Granted"
- No error messages
- App tracking is enabled

### Test 2: App Selection
**Objective**: Verify users can select which apps to track

**Steps**:
1. Create a new group or join existing group
2. Navigate to group settings
3. Look for "Tracked Apps" or "Select Apps" option
4. Choose 2-3 apps to track (Instagram, TikTok, etc.)
5. Save selection

**Expected Result**:
- Selected apps appear in group settings
- Apps are stored in database
- Group members can see tracked apps

### Test 3: Real-Time Detection
**Objective**: Verify app detects when tracked apps are opened

**Steps**:
1. Ensure app is running in background
2. Open a tracked app (e.g., Instagram)
3. Use the app for 10-15 seconds
4. Return to Weak Link app
5. Check for any logged events

**Expected Result**:
- Event is logged in database
- No false positives for non-tracked apps
- Detection happens within 5-10 seconds

### Test 4: Cross-User Notifications
**Objective**: Verify group members are notified when someone opens tracked apps

**Steps**:
1. Have User A open a tracked app
2. User B should check for notifications
3. User B should check leaderboard updates
4. Verify real-time updates in UI

**Expected Result**:
- User B receives notification
- Leaderboard shows updated counts
- Real-time events appear in UI

### Test 5: Database Verification
**Objective**: Verify events are properly stored in database

**Steps**:
1. Open Supabase dashboard
2. Navigate to events table
3. Check for new entries when apps are opened
4. Verify data integrity (user_id, group_id, app_name, timestamp)

**Expected Result**:
- Events table has new entries
- Data is accurate and complete
- Timestamps are correct

## 🐛 Common Issues & Solutions

### Issue: "Permission not granted"
**Solution**: 
- Android: Go to Settings > Apps > Weak Link > Permissions > Usage Access
- iOS: Go to Settings > Screen Time > App Limits > Weak Link

### Issue: "No apps detected"
**Solution**:
- Ensure app is running in background
- Check if tracked apps are properly selected
- Verify native modules are working

### Issue: "Notifications not working"
**Solution**:
- Check notification permissions
- Verify real-time subscriptions are active
- Test with different users

## 📊 Success Criteria

- [ ] Permissions can be granted successfully
- [ ] Apps can be selected for tracking
- [ ] Tracked apps are detected when opened
- [ ] Events are logged to database
- [ ] Group members receive notifications
- [ ] Leaderboard updates in real-time
- [ ] No false positives for non-tracked apps

## 🔧 Debug Information

If tests fail, check:
1. Console logs for error messages
2. Database for missing entries
3. Network connectivity
4. Native module compilation
5. Permission status

## 📝 Test Results

**Date**: ___________
**Tester**: ___________
**Device**: ___________
**Platform**: Android/iOS

### Results:
- [ ] Test 1: Permission Setup - PASS/FAIL
- [ ] Test 2: App Selection - PASS/FAIL  
- [ ] Test 3: Real-Time Detection - PASS/FAIL
- [ ] Test 4: Cross-User Notifications - PASS/FAIL
- [ ] Test 5: Database Verification - PASS/FAIL

### Issues Found:
_________________________________
_________________________________
_________________________________

### Notes:
_________________________________
_________________________________
_________________________________
