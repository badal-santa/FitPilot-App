import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Download } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/colors";
import { type AppUpdateInfo, checkForAppUpdate, getApplicationId } from "@/lib/app-version-api";

// "Later" hides an optional update for this long, per latest version — a
// newer release shows again right away.
const SNOOZE_MS = 24 * 60 * 60 * 1000;
// v2: the earlier gorhom-based sheet recorded snoozes it never showed.
const SNOOZE_KEY = "fitpilot_update_snooze_v2";

// Start the sheet off-screen; it slides up once the modal is shown.
const HIDDEN_OFFSET = 600;

type Snooze = { version: string; until: number };

async function isSnoozed(version: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const snooze = JSON.parse(raw) as Snooze;
    return snooze.version === version && snooze.until > Date.now();
  } catch {
    return false;
  }
}

function snooze(version: string) {
  const value: Snooze = { version, until: Date.now() + SNOOZE_MS };
  AsyncStorage.setItem(SNOOZE_KEY, JSON.stringify(value)).catch(() => {});
}

function getStoreUrl(update: AppUpdateInfo): string | null {
  if (update.storeUrl) return update.storeUrl;
  const appId = getApplicationId();
  return Platform.OS === "android" && appId ? `market://details?id=${appId}` : null;
}

/**
 * Checks /app/version on launch and whenever the app returns to the
 * foreground, and slides up a sheet when a newer build is in the store.
 * Below the admin-configured minimum version the update is forced: no
 * "Later", no backdrop tap, Android back does nothing. Mount once in App.
 *
 * Built on RN's Modal rather than @gorhom/bottom-sheet: it has to sit above
 * every screen (native-stack included) from app root, and gorhom's modal
 * never mounted when presented from there.
 */
export default function AppUpdateSheet() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  // useState initializer rather than useRef().current — React Compiler's
  // lint rejects reading ref values during render.
  const [translateY] = useState(() => new Animated.Value(HIDDEN_OFFSET));

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      checkForAppUpdate()
        .then(async (info) => {
          if (cancelled) return;
          if (!info || (!info.forced && (await isSnoozed(info.latestVersion)))) {
            // Also closes a forced sheet once the user has updated.
            setUpdate(null);
            return;
          }
          setUpdate(info);
        })
        // Offline / server down — never block the app over an update check.
        .catch((error) => {
          if (__DEV__) console.warn("App update check failed:", error);
        });
    };

    check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const slideIn = () => {
    translateY.setValue(HIDDEN_OFFSET);
    Animated.spring(translateY, {
      toValue: 0,
      damping: 20,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleLater = () => {
    if (!update || update.forced) return;
    snooze(update.latestVersion);
    Animated.timing(translateY, {
      toValue: HIDDEN_OFFSET,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setUpdate(null));
  };

  const handleUpdate = async () => {
    if (!update) return;
    const url = getStoreUrl(update);
    try {
      if (!url) throw new Error("missing store url");
      await Linking.openURL(url);
    } catch {
      // Alert, not a toast — toasts render under the modal.
      Alert.alert("Couldn't open the store", "Please update FitPilot from the app store.");
    }
  };

  const notes = (update?.releaseNotes ?? "")
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return (
    <Modal
      visible={update !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={slideIn}
      // Android back: "Later" for optional updates, ignored when forced.
      onRequestClose={handleLater}
    >
      <View className="flex-1 justify-end">
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]}
          onPress={handleLater}
          disabled={update?.forced}
        />

        {update ? (
          <Animated.View
            className="rounded-t-[28px] border-t border-border px-6 pt-3"
            style={{
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }],
            }}
          >
            {!update.forced ? (
              <View
                className="mb-3 h-1 w-10 self-center rounded-full"
                style={{ backgroundColor: colors.border }}
              />
            ) : (
              <View className="mb-3 h-1" />
            )}

            <View className="items-center">
              <View
                className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl"
                style={{
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Download size={28} color={colors.bg} strokeWidth={2.2} />
              </View>

              <Text className="mt-5 font-extrabold text-xl text-text">
                {update.forced ? "Update Required" : "New Update Available"}
              </Text>
              <Text className="mt-1.5 text-center font-regular text-sm text-text-muted">
                {update.forced
                  ? "This version of FitPilot is no longer supported. Please update to keep training."
                  : "A newer version of FitPilot is ready with improvements and fixes."}
              </Text>

              <View className="mt-4 flex-row items-center gap-2">
                <VersionPill label={`v${update.installedVersion}`} muted />
                <Text className="text-sm text-text-muted">→</Text>
                <VersionPill label={`v${update.latestVersion}`} />
              </View>
            </View>

            {notes.length > 0 ? (
              <View className="mt-6 rounded-2xl border border-border bg-bg p-4" style={{ gap: 10 }}>
                <Text
                  className="font-bold text-[11px] uppercase tracking-[1px]"
                  style={{ color: colors.textMuted }}
                >
                  What&apos;s new
                </Text>
                {notes.map((note, index) => (
                  <View key={index} className="flex-row items-start gap-2.5">
                    <View
                      className="mt-0.5 h-4 w-4 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${colors.primary}25` }}
                    >
                      <Check size={10} color={colors.primary} strokeWidth={3} />
                    </View>
                    <Text className="flex-1 font-medium text-[13px] leading-5 text-text">
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              onPress={handleUpdate}
              className="mt-6 h-14 items-center justify-center rounded-2xl active:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="font-bold text-base" style={{ color: colors.bg }}>
                Update Now
              </Text>
            </Pressable>

            {!update.forced ? (
              <Pressable
                onPress={handleLater}
                className="mt-2 h-12 items-center justify-center active:opacity-70"
              >
                <Text className="font-semibold text-sm text-text-muted">Maybe Later</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}

function VersionPill({ label, muted }: { label: string; muted?: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: muted ? colors.border : `${colors.primary}20` }}
    >
      <Text
        className="font-bold text-xs"
        style={{ color: muted ? colors.textMuted : colors.primary }}
      >
        {label}
      </Text>
    </View>
  );
}
