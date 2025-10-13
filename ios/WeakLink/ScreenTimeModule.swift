import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings

@objc(ScreenTimeModule)
class ScreenTimeModule: NSObject {
  let authorizationCenter = AuthorizationCenter.shared
  let activityCenter = DeviceActivityCenter()

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        try await authorizationCenter.requestAuthorization(for: .individual)
        resolve(true)
      } catch {
        reject("AUTH_ERROR", "Screen Time permission failed", error)
      }
    }
  }

  @objc
  func checkPermission(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let status = authorizationCenter.authorizationStatus
    let isAuthorized = status == .approved
    resolve(isAuthorized)
  }

  @objc
  func startMonitoring(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: 0, minute: 0),
      intervalEnd: DateComponents(hour: 23, minute: 59),
      repeats: true
    )

    do {
      try activityCenter.startMonitoring(.daily, during: schedule)
      resolve(true)
    } catch {
      reject("MONITORING_ERROR", "Failed to start monitoring", error)
    }
  }

  @objc
  func stopMonitoring(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    activityCenter.stopMonitoring([.daily])
    resolve(true)
  }
}
