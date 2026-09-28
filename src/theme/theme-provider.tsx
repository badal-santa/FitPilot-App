import { useColorScheme, vars } from "nativewind";
import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { loadThemePreference } from "./theme-slice";
import { THEME_VARS } from "./tokens";

/**
 * Applies the resolved color scheme as CSS vars on a wrapping View, so every
 * `bg-bg` / `text-text` / etc. class in the tree repaints automatically.
 * Preference ("system" | "light" | "dark") is persisted. Passing it straight
 * through to nativewind's `setColorScheme` matters: passing "system" tells it
 * to release its native override and go back to tracking the OS scheme live
 * (including on resume from background). Resolving "system" to a concrete
 * "light"/"dark" ourselves — as this used to do — forces a native override via
 * `Appearance.setColorScheme`, a dev-only API, which fights nativewind's own
 * listener and only catches up on a full app relaunch.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.theme.preference);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    dispatch(loadThemePreference());
  }, [dispatch]);

  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const active = colorScheme === "light" ? "light" : "dark";

  return (
    <View style={[{ flex: 1 }, vars(THEME_VARS[active]) as ViewStyle]}>{children}</View>
  );
}
