/**
 * Text styles for YunYingTV
 * Optimized based on best practices from:
 * - Inter font family weight hierarchy (400-700)
 * - Raycast positive letter-spacing (+0.2px for display sizes)
 * - Apple/Linear reduced-weight headings (600 instead of bold for h4-h6)
 * - Expo monochromatic readability
 */

import {TextStyle} from 'react-native';
import { DeviceType } from '@/hooks/useResponsiveLayout';

export interface TextStyles {
  [key: string]: TextStyle & {fontSize: number; lineHeight: number};
}

export const getTextStyles = function (
  scale: number,
  linkColor: string,
  deviceType: DeviceType = 'mobile',
): TextStyles {
  let deviceScale = 1;
  switch (deviceType) {
    case 'mobile':
      deviceScale = 1;
      break;
    case 'tablet':
      deviceScale = 1.1;
      break;
    case 'tv':
      deviceScale = 1.3;
      break;
  }

  const finalScale = scale * deviceScale;

  return {
    // ─── Headings (Weight hierarchy: h1=800 → h6=600, Raycast letter-spacing) ───
    h1: {
      fontSize: 36 * finalScale,
      fontWeight: "800",
      lineHeight: 44 * finalScale,
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 32 * finalScale,
      fontWeight: "700",
      lineHeight: 40 * finalScale,
      letterSpacing: 0.3,
    },
    h3: {
      fontSize: 28 * finalScale,
      fontWeight: "700",
      lineHeight: 36 * finalScale,
      letterSpacing: 0.2,
    },
    h4: {
      fontSize: 24 * finalScale,
      fontWeight: "600",
      lineHeight: 32 * finalScale,
      letterSpacing: 0.15,
    },
    h5: {
      fontSize: 20 * finalScale,
      fontWeight: "600",
      lineHeight: 28 * finalScale,
      letterSpacing: 0.1,
    },
    h6: {
      fontSize: 18 * finalScale,
      fontWeight: "600",
      lineHeight: 24 * finalScale,
    },

    // ─── Title Styles (Apple/Linear pattern - semibold emphasis) ───
    title1: {
      fontSize: 28 * finalScale,
      fontWeight: "700",
      lineHeight: 36 * finalScale,
      letterSpacing: 0.2,
    },
    title2: {
      fontSize: 22 * finalScale,
      fontWeight: "600",
      lineHeight: 28 * finalScale,
      letterSpacing: 0.1,
    },
    title3: {
      fontSize: 20 * finalScale,
      fontWeight: "600",
      lineHeight: 26 * finalScale,
    },

    // ─── Body Text (Inter 400 base, 600 for bold) ───
    body: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
    },
    bodyBold: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: "600",
    },
    bodySmall: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
    },
    bodySmallBold: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: "600",
    },

    // ─── Caption (Reduced prominence - Linear tertiary text pattern) ───
    caption: {
      fontSize: 12 * finalScale,
      lineHeight: 16 * finalScale,
    },
    captionBold: {
      fontSize: 12 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: "600",
    },

    // ─── Subtitle (Muted secondary text - Notion warm neutral approach) ───
    subtitle: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      color: '#8B919A',
    },
    subtitleBold: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: "600",
      color: '#8B919A',
    },

    // ─── Button Text (Expo pill-shaped CTAs, 600 weight standard) ───
    button: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: "600",
    },
    buttonSmall: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: "600",
    },
    buttonLarge: {
      fontSize: 18 * finalScale,
      lineHeight: 28 * finalScale,
      fontWeight: "600",
    },

    // ─── Link Text ───
    link: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      color: linkColor,
      textDecorationLine: 'underline',
    },
    linkSmall: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      color: linkColor,
      textDecorationLine: 'underline',
    },

    // ─── Navigation (500 active, 600 selected) ───
    navItem: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: "500",
    },
    navItemActive: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: "600",
    },

    // ─── Tab Text (Compact, 500-600 weight) ───
    tab: {
      fontSize: 11 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: "500",
    },
    tabActive: {
      fontSize: 11 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: "600",
    },
  };
};

export const defaultTextStyles = getTextStyles(1, '#0D9EDF', 'mobile');
export const tabletTextStyles = getTextStyles(1, '#0D9EDF', 'tablet');
export const tvTextStyles = getTextStyles(1, '#0D9EDF', 'tv');
