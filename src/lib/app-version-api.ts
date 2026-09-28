import { requireOptionalNativeModule } from "expo";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { apiRequest } from "@/lib/api-client";

export type AppVersionConfig = {
  platform: "android" | "ios";
  latestVersion: string;
  minVersion: string;
  storeUrl: string | null;
  releaseNotes: string | null;
  updatedAt: string;
};

export type AppUpdateInfo = AppVersionConfig & {
  installedVersion: string;
  /** Installed version is below minVersion — the sheet can't be dismissed. */
  forced: boolean;
};

type NativeApplication = { nativeApplicationVersion?: string | null; applicationId?: string | null };

// Read expo-application's native module directly instead of importing the
// package: its JS entry calls requireNativeModule, which throws (and Metro
// reports it as an error even when caught) on a build made before the module
// was added. The optional lookup just returns null there, and we fall back to
// the app.json version until the app is rebuilt.
function getNativeApplication(): NativeApplication | null {
  return requireOptionalNativeModule<NativeApplication>("ExpoApplication");
}

/** The version of the installed binary (versionName / CFBundleShortVersionString). */
export function getInstalledVersion(): string {
  return (
    getNativeApplication()?.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "0.0.0"
  );
}

export function getApplicationId(): string | null {
  return getNativeApplication()?.applicationId ?? null;
}

// Numeric x.y.z compare: negative if a < b, 0 if equal, positive if a > b.
// Missing/non-numeric parts count as 0 so "1.2" == "1.2.0".
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((part) => parseInt(part, 10) || 0);
  const pb = b.split(".").map((part) => parseInt(part, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length, 3); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Returns update info when the installed build is older than the latest
 * version configured in the admin panel, or null when it's up to date (or
 * on web, which always runs the latest bundle).
 */
export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return null;

  const { data } = await apiRequest<{ success: true; data: AppVersionConfig }>("/app/version", {
    params: { platform: Platform.OS },
    auth: false,
  });

  const installedVersion = getInstalledVersion();
  if (compareVersions(installedVersion, data.latestVersion) >= 0) return null;

  return {
    ...data,
    installedVersion,
    forced: compareVersions(installedVersion, data.minVersion) < 0,
  };
}
