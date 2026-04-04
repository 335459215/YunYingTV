/**
 * Design system colors for YunYingTV
 * Optimized based on best practices from:
 * - Linear.app (dark-native surfaces, indigo-violet accents, luminance stacking)
 * - Raycast (blue-tinted near-black backgrounds, multi-layer shadows)
 * - Apple (single accent philosophy, cinematic pacing)
 * - Notion (warm neutrals, ultra-thin borders, sub-0.05 opacity shadows)
 * - Airbnb (three-layer card shadows, generous border-radius)
 * - Expo (monochromatic palette, pill-shaped geometry)
 */

// ─── Primary Accent ───
// Single accent color philosophy (Apple/Linear pattern)
// Green primary optimized for TV visibility and video streaming context
const primaryLight = "#00C96B";
const primaryDark = "#00C96B";
const primaryHoverDark = "#00E077";

// ─── Secondary & Tertiary ───
const secondaryLight = "#0D9EDF";
const secondaryDark = "#0D9EDF";
const tertiaryLight = "#FF6B6B";
const tertiaryDark = "#FF6B6B";

// ─── Backgrounds (Luminance Stacking - Linear/Raycast pattern) ───
// Blue-tinted near-black for cinematic immersion (video app optimal)
const backgroundLight = "#FAFBFC";
const backgroundDark = "#0A0B0D";

// Surface elevation levels (increasing brightness = higher elevation)
const surfaceLight = "#F0F1F3";
const surfaceDark = "#111214";
const surfaceElevatedLight = "#E8E9EB";
const surfaceElevatedDark = "#18191C";
const surfaceOverlayLight = "rgba(0, 0, 0, 0.04)";
const surfaceOverlayDark = "rgba(255, 255, 255, 0.04)";

// ─── Text Colors (Reduced eye strain - Linear/Apple pattern) ───
// Near-white instead of pure white for long viewing sessions
const textPrimaryLight = "#0D1117";
const textPrimaryDark = "#F0F2F5";
const textSecondaryLight = "#6B7280";
const textSecondaryDark = "#8B919A";
const textTertiaryLight = "#9CA3AF";
const textTertiaryDark = "#5C6270";
const textDisabledLight = "#BDBDBD";
const textDisabledDark = "#4A4E56";

// ─── Borders (Semi-transparent - Linear/Raycast/Notion pattern) ───
// Ultra-thin semi-transparent borders instead of solid opaque
const borderLight = "rgba(0, 0, 0, 0.10)";
const borderDark = "rgba(255, 255, 255, 0.08)";
const borderStrongLight = "rgba(0, 0, 0, 0.16)";
const borderStrongDark = "rgba(255, 255, 255, 0.14)";
const borderFocusDark = "rgba(0, 201, 107, 0.50)";

// ─── Status Colors ───
const successLight = "#22C55E";
const successDark = "#22C55E";
const warningLight = "#F59E0B";
const warningDark = "#F59E0B";
const errorLight = "#EF4444";
const errorDark = "#EF4444";
const infoLight = "#3B82F6";
const infoDark = "#3B82F6";

// ─── Tab Colors ───
const tabIconDefaultLight = "#6B7280";
const tabIconDefaultDark = "#5C6270";
const tabIconSelectedLight = primaryLight;
const tabIconSelectedDark = primaryDark;

// ─── Card System (Surface Hierarchy + Shadow Layers - Airbnb/Notion pattern) ───
const cardLight = "#FFFFFF";
const cardDark = "#15161A";
const cardElevatedLight = "#FFFFFF";
const cardElevatedDark = "#1C1D21";
const cardHoverLight = "#F8F9FA";
const cardHoverDark = "#1A1B1F";

// ─── Button Colors ───
const buttonPrimaryLight = primaryLight;
const buttonPrimaryDark = primaryDark;
const buttonSecondaryLight = secondaryLight;
const buttonSecondaryDark = secondaryDark;
const buttonGhostLight = "rgba(0, 0, 0, 0.06)";
const buttonGhostDark = "rgba(255, 255, 255, 0.06)";
const buttonDisabledLight = "#D1D5DB";
const buttonDisabledDark = "#333840";

// ─── Input Colors ───
const inputBackgroundLight = "#F3F4F6";
const inputBackgroundDark = "#18191C";
const inputBorderLight = borderLight;
const inputBorderDark = borderDark;
const inputBorderFocusedLight = primaryLight;
const inputBorderFocusedDark = primaryDark;

// ─── Focus & Interaction States (TV Remote Critical) ───
// Focus ring for TV remote navigation (Apple/Linear pattern)
const focusRingColor = "#00C96B";
const focusRingGlow = "rgba(0, 201, 107, 0.20)";
const pressedOverlayDark = "rgba(255, 255, 255, 0.06)";

// ─── Shadow Definitions (Multi-layer - Airbnb 3-layer + Notion pattern) ───
export const Shadows = {
  light: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 12,
    },
    focus: {
      shadowColor: focusRingColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.40,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  dark: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.20,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.40,
      shadowRadius: 24,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.50,
      shadowRadius: 40,
      elevation: 12,
    },
    focus: {
      shadowColor: focusRingColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.50,
      shadowRadius: 20,
      elevation: 12,
    },
  },
};

// ─── Border Radius (Generous - Airbnb/Expo pattern) ───
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const Colors = {
  light: {
    primary: primaryLight,
    secondary: secondaryLight,
    tertiary: tertiaryLight,

    background: backgroundLight,
    surface: surfaceLight,
    surfaceElevated: surfaceElevatedLight,
    surfaceOverlay: surfaceOverlayLight,

    text: textPrimaryLight,
    textSecondary: textSecondaryLight,
    textTertiary: textTertiaryLight,
    textDisabled: textDisabledLight,

    border: borderLight,
    borderStrong: borderStrongLight,

    success: successLight,
    warning: warningLight,
    error: errorLight,
    info: infoLight,

    tabIconDefault: tabIconDefaultLight,
    tabIconSelected: tabIconSelectedLight,

    card: cardLight,
    cardElevated: cardElevatedLight,
    cardHover: cardHoverLight,

    buttonPrimary: buttonPrimaryLight,
    buttonSecondary: buttonSecondaryLight,
    buttonGhost: buttonGhostLight,
    buttonDisabled: buttonDisabledLight,

    inputBackground: inputBackgroundLight,
    inputBorder: inputBorderLight,
    inputBorderFocused: inputBorderFocusedLight,

    link: secondaryLight,

    focusRing: focusRingColor,
    focusGlow: "rgba(0, 201, 107, 0.15)",
    pressedOverlay: "rgba(0, 0, 0, 0.04)",
  },
  dark: {
    primary: primaryDark,
    primaryHover: primaryHoverDark,
    secondary: secondaryDark,
    tertiary: tertiaryDark,

    background: backgroundDark,
    surface: surfaceDark,
    surfaceElevated: surfaceElevatedDark,
    surfaceOverlay: surfaceOverlayDark,

    text: textPrimaryDark,
    textSecondary: textSecondaryDark,
    textTertiary: textTertiaryDark,
    textDisabled: textDisabledDark,

    border: borderDark,
    borderStrong: borderStrongDark,
    borderFocus: borderFocusDark,

    success: successDark,
    warning: warningDark,
    error: errorDark,
    info: infoDark,

    tabIconDefault: tabIconDefaultDark,
    tabIconSelected: tabIconSelectedDark,

    card: cardDark,
    cardElevated: cardElevatedDark,
    cardHover: cardHoverDark,

    buttonPrimary: buttonPrimaryDark,
    buttonSecondary: buttonSecondaryDark,
    buttonGhost: buttonGhostDark,
    buttonDisabled: buttonDisabledDark,

    inputBackground: inputBackgroundDark,
    inputBorder: inputBorderDark,
    inputBorderFocused: inputBorderFocusedDark,

    link: secondaryDark,

    focusRing: focusRingColor,
    focusGlow: focusRingGlow,
    pressedOverlay: pressedOverlayDark,
  },
};

export const getColor = (
  colorName: keyof typeof Colors.dark,
  mode: "light" | "dark" = "dark"
) => {
  const colorMap = Colors[mode];
  if (colorName in colorMap) {
    return (colorMap as Record<string, string>)[colorName];
  }
  return Colors.dark.text;
};

export const useThemeColor = (
  colorName: keyof typeof Colors.dark
) => {
  return Colors.dark[colorName];
};
