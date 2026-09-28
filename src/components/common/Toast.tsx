import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/colors";

type ToastType = "success" | "error" | "info";

type ToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastItem = {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3200;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    const toast: ToastItem = {
      id: nextId.current,
      type: options.type ?? "info",
      title: options.title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
    };
    // One at a time — a fresh toast replaces whatever's showing, matching
    // how Alert.alert used to fully supersede a prior dialog.
    setToasts([toast]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, message) => show({ type: "success", title, message }),
      error: (title, message) => show({ type: "error", title, message }),
      info: (title, message) => show({ type: "info", title, message }),
    }),
    [show],
  );

  const active = toasts[0] ?? null;

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {active ? (
            <ToastCard key={active.id} toast={active} onDismiss={() => dismiss(active.id)} />
          ) : null}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

const VARIANT_ICON: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const accent =
    toast.type === "success" ? colors.primary : toast.type === "error" ? colors.danger : colors.info;
  const Icon = VARIANT_ICON[toast.type];

  return (
    <Animated.View
      entering={FadeInUp.duration(320).springify().damping(19).stiffness(220)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="box-none"
      style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16 }}
    >
      <Pressable
        onPress={onDismiss}
        className="flex-row items-center overflow-hidden rounded-[20px] px-4 py-3.5"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon size={17} color={accent} strokeWidth={2.2} />
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-bold text-[13px] text-text" numberOfLines={2}>
            {toast.title}
          </Text>
          {toast.message ? (
            <Text className="mt-0.5 font-regular text-[11.5px] text-text-muted" numberOfLines={2}>
              {toast.message}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
