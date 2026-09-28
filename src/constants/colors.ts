import { useColorScheme } from "nativewind";

import { DARK_COLORS, LIGHT_COLORS, type ThemeColors } from "@/theme/tokens";

export { DARK_COLORS, LIGHT_COLORS };
export type { ThemeColors };

/** JS-side theme colors (icon fills, SVG strokes, gradients, StatusBar) for
 * the currently active scheme — mirrors the `bg-*`/`text-*` classes. */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === "light" ? LIGHT_COLORS : DARK_COLORS;
}
