# 🔧 Native Module Setup Guide

## ❌ **Error: "ScreenTimeModule not available"**

This error occurs when the native modules aren't properly configured in your React Native/Expo project. Here's how to fix it:

---

## 🚨 **Quick Diagnosis**

### **Check Module Status:**
1. Open the app
2. Go to **Settings** → **App Tracking Debugger**
3. Look at **"Module Status"** section
4. Check if modules show **"Available"** or **"Not Available"**

---

## 🛠️ **Solution Options**

### **Option 1: Development Build (Recommended)**

#### **For Expo Projects:**
```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Configure development build
eas build --profile development --platform ios

# 3. Install on device
eas build:run --platform ios
```

#### **For React Native CLI:**
```bash
# 1. Install iOS dependencies
cd ios && pod install && cd ..

# 2. Build for device
npx react-native run-ios --device
```

### **Option 2: Expo Go (Limited)**

**Note**: Native modules don't work in Expo Go. You'll see "Not Available" status.

**Workaround**: Use the fallback implementations for testing UI/UX.

---

## 📱 **iOS Setup (Screen Time Module)**

### **1. Add Native Module Files**

Ensure these files exist in your iOS project:
```
ios/WeakLink/
├── ScreenTimeModule.swift
├── ScreenTimeModule.m
└── (other iOS files)
```

### **2. Configure Xcode Project**

1. **Open Xcode project**
2. **Add ScreenTimeModule.swift** to project
3. **Add ScreenTimeModule.m** to project
4. **Link FamilyControls framework**

### **3. Add Framework Dependencies**

In your iOS project, add:
- `FamilyControls.framework`
- `DeviceActivity.framework`
- `ManagedSettings.framework`

### **4. Update Info.plist**

Add Screen Time usage description:
```xml
<key>NSFamilyControlsUsageDescription</key>
<string>This app uses Screen Time to help you track and limit app usage.</string>
```

---

## 🤖 **Android Setup (Usage Stats Module)**

### **1. Add Permissions**

In `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

### **2. Add Native Module**

Create `android/app/src/main/java/com/weaklink/UsageStatsModule.java`:
```java
package com.weaklink;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class UsageStatsModule extends ReactContextBaseJavaModule {
    // Implementation here
}
```

---

## 🧪 **Testing the Setup**

### **1. Check Module Status**
```bash
# In the app debugger, verify:
✅ Platform: ios/android
✅ Screen Time Module: Available
✅ Usage Stats Module: Available (Android)
```

### **2. Test Permission Flow**
```bash
# Should work without errors:
✅ Check Permissions
✅ Request Permissions
✅ Start Monitoring
```

### **3. Test App Detection**
```bash
# Should detect real apps:
✅ Current App: [actual app name]
✅ Monitoring: Updates in real-time
```

---

## 🔍 **Troubleshooting**

### **"ScreenTimeModule not available"**

#### **Cause**: Native module not linked
#### **Fix**: 
1. Ensure you're using a development build
2. Check if native module files exist
3. Verify Xcode project configuration
4. Rebuild the app completely

### **"UsageStatsModule not available" (Android)**

#### **Cause**: Android native module not configured
#### **Fix**:
1. Add UsageStatsModule.java
2. Register module in MainApplication.java
3. Add PACKAGE_USAGE_STATS permission
4. Rebuild the app

### **"Permission denied"**

#### **Cause**: User denied permission
#### **Fix**:
1. Go to device Settings
2. Grant Screen Time permission (iOS)
3. Grant Usage Access permission (Android)
4. Try again in the app

---

## 📋 **Verification Checklist**

- [ ] **Development build** installed on device
- [ ] **Native module files** exist in project
- [ ] **Framework dependencies** linked in Xcode
- [ ] **Permissions** granted in device settings
- [ ] **Module status** shows "Available" in debugger
- [ ] **App detection** works in debugger
- [ ] **Permission flow** works without errors

---

## 🆘 **Still Having Issues?**

### **1. Check Build Logs**
```bash
# Look for errors like:
- "Module not found"
- "Framework not found"
- "Permission denied"
```

### **2. Verify Project Structure**
```bash
# Ensure files exist:
- ios/WeakLink/ScreenTimeModule.swift
- ios/WeakLink/ScreenTimeModule.m
- android/.../UsageStatsModule.java
```

### **3. Test on Different Device**
- Try on another device
- Check iOS/Android version compatibility
- Verify device permissions

---

## 🎯 **Expected Results**

After proper setup, you should see:
- ✅ **Module Status**: All modules "Available"
- ✅ **Permission Flow**: Works without errors
- ✅ **App Detection**: Shows real app names
- ✅ **Monitoring**: Updates in real-time
- ✅ **Events**: Logged to database

The improved error handling now provides clear guidance for resolving native module issues!
