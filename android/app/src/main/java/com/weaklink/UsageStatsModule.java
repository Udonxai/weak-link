package com.weaklink;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class UsageStatsModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private static final String TAG = "UsageStatsModule";

    public UsageStatsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "UsageStatsModule";
    }

    @ReactMethod
    public void getForegroundApp(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);

            if (usm == null) {
                promise.reject("USAGE_STATS_ERROR", "UsageStatsManager not available");
                return;
            }

            long time = System.currentTimeMillis();
            List<UsageStats> appList = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 10,
                time
            );

            if (appList != null && !appList.isEmpty()) {
                SortedMap<Long, UsageStats> sortedMap = new TreeMap<>();
                for (UsageStats usageStats : appList) {
                    sortedMap.put(usageStats.getLastTimeUsed(), usageStats);
                }

                if (!sortedMap.isEmpty()) {
                    String currentApp = sortedMap.get(sortedMap.lastKey()).getPackageName();
                    promise.resolve(currentApp);
                    return;
                }
            }

            promise.resolve("unknown");
        } catch (Exception e) {
            Log.e(TAG, "Error getting foreground app", e);
            promise.reject("USAGE_STATS_ERROR", e);
        }
    }

    @ReactMethod
    public void checkPermission(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            long time = System.currentTimeMillis();
            List<UsageStats> appList = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 1000,
                time
            );

            boolean hasPermission = appList != null && !appList.isEmpty();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager packageManager = reactContext.getPackageManager();
            List<ApplicationInfo> installedApps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA);
            
            WritableArray appList = Arguments.createArray();
            
            for (ApplicationInfo appInfo : installedApps) {
                // Only include user-installed apps (not system apps)
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    WritableMap app = Arguments.createMap();
                    app.putString("packageName", appInfo.packageName);
                    app.putString("appName", packageManager.getApplicationLabel(appInfo).toString());
                    appList.pushMap(app);
                }
            }
            
            promise.resolve(appList);
        } catch (Exception e) {
            Log.e(TAG, "Error getting installed apps", e);
            promise.reject("INSTALLED_APPS_ERROR", e);
        }
    }
}
