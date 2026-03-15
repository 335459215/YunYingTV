/**
 * Design system colors for the app
 * This file defines the color palette for both light and dark modes
 */

// Primary colors
const primaryLight = "#00bb5e";
const primaryDark = "#00bb5e";

// Secondary colors
const secondaryLight = "#0a7ea4";
const secondaryDark = "#0a7ea4";

// Tertiary colors
const tertiaryLight = "#ff6b6b";
const tertiaryDark = "#ff6b6b";

// Background colors
const backgroundLight = "#fff";
const backgroundDark = "#151718";
const surfaceLight = "#f8f9fa";
const surfaceDark = "#1c1c1e";

// Text colors
const textPrimaryLight = "#11181C";
const textPrimaryDark = "#ECEDEE";
const textSecondaryLight = "#687076";
const textSecondaryDark = "#9BA1A6";
const textDisabledLight = "#999";
const textDisabledDark = "#666";

// Border colors
const borderLight = "#E5E5E5";
const borderDark = "#333";
const borderLightHover = "#ddd";
const borderDarkHover = "#444";

// Status colors
const successLight = "#28a745";
const successDark = "#28a745";
const warningLight = "#ffc107";
const warningDark = "#ffc107";
const errorLight = "#dc3545";
const errorDark = "#dc3545";
const infoLight = "#17a2b8";
const infoDark = "#17a2b8";

// Tab colors
const tabIconDefaultLight = "#687076";
const tabIconDefaultDark = "#9BA1A6";
const tabIconSelectedLight = primaryLight;
const tabIconSelectedDark = primaryDark;

// Card colors
const cardLight = "#fff";
const cardDark = "#252525";
const cardHoverLight = "#f5f5f5";
const cardHoverDark = "#2a2a2a";

// Button colors
const buttonPrimaryLight = primaryLight;
const buttonPrimaryDark = primaryDark;
const buttonSecondaryLight = secondaryLight;
const buttonSecondaryDark = secondaryDark;
const buttonDisabledLight = "#ccc";
const buttonDisabledDark = "#555";

// Input colors
const inputBackgroundLight = "#f8f9fa";
const inputBackgroundDark = "#2a2a2a";
const inputBorderLight = borderLight;
const inputBorderDark = borderDark;
const inputBorderFocusedLight = primaryLight;
const inputBorderFocusedDark = primaryDark;

export const Colors = {
  light: {
    // Primary colors
    primary: primaryLight,
    secondary: secondaryLight,
    tertiary: tertiaryLight,
    
    // Background colors
    background: backgroundLight,
    surface: surfaceLight,
    
    // Text colors
    text: textPrimaryLight,
    textSecondary: textSecondaryLight,
    textDisabled: textDisabledLight,
    
    // Border colors
    border: borderLight,
    borderHover: borderLightHover,
    
    // Status colors
    success: successLight,
    warning: warningLight,
    error: errorLight,
    info: infoLight,
    
    // Tab colors
    tabIconDefault: tabIconDefaultLight,
    tabIconSelected: tabIconSelectedLight,
    
    // Card colors
    card: cardLight,
    cardHover: cardHoverLight,
    
    // Button colors
    buttonPrimary: buttonPrimaryLight,
    buttonSecondary: buttonSecondaryLight,
    buttonDisabled: buttonDisabledLight,
    
    // Input colors
    inputBackground: inputBackgroundLight,
    inputBorder: inputBorderLight,
    inputBorderFocused: inputBorderFocusedLight,
    
    // Link color
    link: secondaryLight,
  },
  dark: {
    // Primary colors
    primary: primaryDark,
    secondary: secondaryDark,
    tertiary: tertiaryDark,
    
    // Background colors
    background: backgroundDark,
    surface: surfaceDark,
    
    // Text colors
    text: textPrimaryDark,
    textSecondary: textSecondaryDark,
    textDisabled: textDisabledDark,
    
    // Border colors
    border: borderDark,
    borderHover: borderDarkHover,
    
    // Status colors
    success: successDark,
    warning: warningDark,
    error: errorDark,
    info: infoDark,
    
    // Tab colors
    tabIconDefault: tabIconDefaultDark,
    tabIconSelected: tabIconSelectedDark,
    
    // Card colors
    card: cardDark,
    cardHover: cardHoverDark,
    
    // Button colors
    buttonPrimary: buttonPrimaryDark,
    buttonSecondary: buttonSecondaryDark,
    buttonDisabled: buttonDisabledDark,
    
    // Input colors
    inputBackground: inputBackgroundDark,
    inputBorder: inputBorderDark,
    inputBorderFocused: inputBorderFocusedDark,
    
    // Link color
    link: secondaryDark,
  },
};

// Common color utilities
export const getColor = (colorName: keyof typeof Colors.dark, mode: 'light' | 'dark' = 'dark') => {
  return Colors[mode][colorName];
};

// Theme-aware color utilities
export const useThemeColor = (colorName: keyof typeof Colors.dark) => {
  // This will be replaced with a proper theme hook
  return Colors.dark[colorName];
};
