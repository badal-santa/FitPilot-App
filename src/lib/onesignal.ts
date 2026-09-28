import { LogLevel, OneSignal } from "react-native-onesignal";

const ONE_SIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

let initialized = false;

/**
 * Safe to call any number of times — only the first call initializes.
 * login/logout call it themselves, since OneSignal throws "Must call
 * initWithContext before login" if login() runs before initialize().
 */
export function initializeOneSignal(): boolean {
  if (initialized) return true;

  if (!ONE_SIGNAL_APP_ID) {
    console.warn("OneSignal App ID is missing");
    return false;
  }

  try {
    if (__DEV__) OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    OneSignal.initialize(ONE_SIGNAL_APP_ID);
    initialized = true;

    // Ask for notification permission.
    OneSignal.Notifications.requestPermission(false);
  } catch (error) {
    console.warn("OneSignal initialization failed:", error);
  }

  return initialized;
}

// Push is best-effort: a OneSignal failure must never break sign-in/sign-out.
export function loginToOneSignal(userId: string) {
  if (!userId || !initializeOneSignal()) {
    return;
  }

  try {
    console.log("🔔 Linking OneSignal user:", userId);
    OneSignal.login(userId);
  } catch (error) {
    console.warn("OneSignal login failed:", error);
  }
}

export function logoutFromOneSignal() {
  if (!initializeOneSignal()) {
    return;
  }

  try {
    console.log("🔔 Logging out from OneSignal");
    OneSignal.logout();
  } catch (error) {
    console.warn("OneSignal logout failed:", error);
  }
}
