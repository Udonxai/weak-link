# 🔧 Screen Time Permission Troubleshooting Guide

## ❌ **Error: "Failed to configure Screen Time Permissions"**

This error occurs when the iOS Screen Time API fails to grant or configure permissions. Here's how to fix it:

---

## 🛠️ **Immediate Fixes**

### **1. Check Device Requirements**
- ✅ **iOS 15.0+** required
- ✅ **Physical device** (not simulator)
- ✅ **Development build** (not Expo Go)

### **2. Manual Permission Setup**
1. **Open iOS Settings**
2. **Go to Screen Time**
3. **Tap "App Limits"**
4. **Add "Weak Link" to allowed apps**
5. **Grant "Usage Access" permission**

### **3. Reset Screen Time Permissions**
1. **Settings > Screen Time**
2. **Turn OFF Screen Time**
3. **Wait 30 seconds**
4. **Turn ON Screen Time**
5. **Try the app again**

---

## 🔍 **Debugging Steps**

### **Step 1: Check Current Status**
```bash
# In the app debugger, check:
- Permission Status: Should show "Granted"
- Current App: Should show actual app names
- Platform: Should show "ios"
```

### **Step 2: Test Permission Flow**
1. **Open Settings in the app**
2. **Tap "App Tracking Debugger"**
3. **Tap "Check Permissions"**
4. **Look for specific error messages**

### **Step 3: Verify Native Module**
```bash
# Check if native modules are properly linked:
npx react-native run-ios
# Should build without errors
```

---

## 🚨 **Common Error Messages & Solutions**

### **"AUTH_DENIED"**
- **Cause**: User denied permission
- **Fix**: Go to Settings > Screen Time > App Limits > Allow Weak Link

### **"AUTH_ERROR"**
- **Cause**: System error during permission request
- **Fix**: Restart device and try again

### **"NO_PERMISSION"**
- **Cause**: Permission not granted yet
- **Fix**: Grant permission in device settings first

### **"MONITORING_ERROR"**
- **Cause**: Permission granted but monitoring failed
- **Fix**: This is normal for development builds

---

## 📱 **Device-Specific Solutions**

### **iPhone 12/13/14/15**
- ✅ Usually works with standard setup
- Check iOS version (15.0+ required)

### **iPhone 11 and older**
- ⚠️ May have limited Screen Time API support
- Try updating to latest iOS version

### **iPad**
- ✅ Should work the same as iPhone
- Check if Screen Time is enabled

---

## 🔧 **Development Build Issues**

### **Problem**: Works in simulator but not device
- **Cause**: Screen Time API only works on physical devices
- **Solution**: Test on real device only

### **Problem**: Permission granted but no monitoring
- **Cause**: Development builds have limited monitoring capabilities
- **Solution**: This is expected behavior for testing

### **Problem**: Build errors with native modules
- **Cause**: Native modules not properly configured
- **Solution**: Follow iOS setup guide in documentation

---

## 🧪 **Testing the Fix**

### **1. Permission Test**
```bash
# Should show:
✅ Permission Status: Granted
✅ Current App: [actual app name]
✅ Platform: ios
```

### **2. Monitoring Test**
```bash
# Should show:
✅ Monitoring starts successfully
✅ App detection works
✅ Events are logged to database
```

### **3. Error Handling Test**
```bash
# Should show:
✅ Clear error messages
✅ Specific troubleshooting steps
✅ Graceful fallbacks
```

---

## 📋 **Success Checklist**

- [ ] **Permission Status**: Shows "Granted"
- [ ] **App Detection**: Shows real app names
- [ ] **Error Messages**: Clear and helpful
- [ ] **Monitoring**: Starts without errors
- [ ] **Events**: Appear in database
- [ ] **User Experience**: Smooth permission flow

---

## 🆘 **Still Having Issues?**

### **1. Check Console Logs**
```bash
# Look for specific error messages:
- "AUTH_DENIED"
- "AUTH_ERROR" 
- "NO_PERMISSION"
- "MONITORING_ERROR"
```

### **2. Verify Native Module Setup**
```bash
# Ensure iOS project has:
- ScreenTimeModule.swift
- ScreenTimeModule.m
- Proper bridging header
- FamilyControls framework
```

### **3. Test on Different Device**
- Try on another iPhone
- Check if issue is device-specific
- Verify iOS version compatibility

---

## 📞 **Need More Help?**

1. **Check the debugger** for specific error messages
2. **Review console logs** for detailed error info
3. **Test on physical device** (not simulator)
4. **Verify iOS version** (15.0+ required)
5. **Check Screen Time settings** in device settings

The improved error handling should now provide specific guidance for each type of permission failure!
