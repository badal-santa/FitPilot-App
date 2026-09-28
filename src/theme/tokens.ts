// Single source of truth for theme colors: hex (for JS — icons, SVG, gradients,
// StatusBar) and the matching "R G B" triplets NativeWind's CSS vars need for its
// `rgb(var(--x) / <alpha-value>)` opacity-modifier syntax (e.g. `bg-primary/40`).

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryDark: string;
  text: string;
  textMuted: string;
  textFaint: string;
  danger: string;
  warning: string;
  info: string;
};

export const DARK_COLORS: ThemeColors = {
  bg: "#050807",
  surface: "#0B1110",
  surfaceAlt: "#101917",
  border: "#1C3028",
  primary: "#62F2A2",
  primaryDark: "#0D8F59",
  text: "#FFFFFF",
  textMuted: "#8B9892",
  textFaint: "#56615C",
  danger: "#FF5C5C",
  warning: "#FFB84D",
  info: "#67D7FF",
};

export const LIGHT_COLORS: ThemeColors = {
  bg: "#F6FAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF5EE",
  border: "#DCE8E1",
  primary: "#0D8F59",
  primaryDark: "#0A6B45",
  text: "#08120D",
  textMuted: "#57655D",
  textFaint: "#8A968F",
  danger: "#E14A3A",
  warning: "#C97C0A",
  info: "#1483B5",
};

function hexToRgbTriplet(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function toCssVars(colors: ThemeColors) {
  return {
    "--color-bg": hexToRgbTriplet(colors.bg),
    "--color-surface": hexToRgbTriplet(colors.surface),
    "--color-surface-alt": hexToRgbTriplet(colors.surfaceAlt),
    "--color-border": hexToRgbTriplet(colors.border),
    "--color-primary": hexToRgbTriplet(colors.primary),
    "--color-primary-dark": hexToRgbTriplet(colors.primaryDark),
    "--color-text": hexToRgbTriplet(colors.text),
    "--color-text-muted": hexToRgbTriplet(colors.textMuted),
    "--color-text-faint": hexToRgbTriplet(colors.textFaint),
    "--color-danger": hexToRgbTriplet(colors.danger),
    "--color-warning": hexToRgbTriplet(colors.warning),
    "--color-info": hexToRgbTriplet(colors.info),
  };
}

export const THEME_VARS = {
  dark: toCssVars(DARK_COLORS),
  light: toCssVars(LIGHT_COLORS),
};
