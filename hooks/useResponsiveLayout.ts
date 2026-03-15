import { useState, useEffect } from "react";
import { Dimensions, Platform, PixelRatio } from "react-native";

export type DeviceType = "mobile" | "tablet" | "tv";

export interface ResponsiveConfig {
  deviceType: DeviceType;
  columns: number;
  cardWidth: number;
  cardHeight: number;
  spacing: number;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  scale: number;
  fontScale: number;
}

const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  tv: { min: 1024, max: Infinity },
};

const getDeviceType = (width: number): DeviceType => {
  if (Platform.isTV) return "tv";

  if (width >= BREAKPOINTS.tv.min) return "tv";
  if (width >= BREAKPOINTS.tablet.min) return "tablet";
  return "mobile";
};

const getLayoutConfig = (
  deviceType: DeviceType,
  width: number,
  height: number,
  isPortrait: boolean
): ResponsiveConfig => {
  const scale = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  
  // 根据设备类型和屏幕尺寸动态计算间距
  let spacing: number;
  if (deviceType === "mobile") {
    spacing = Math.max(8, Math.min(12, width * 0.02));
  } else if (deviceType === "tablet") {
    spacing = Math.max(12, Math.min(16, width * 0.015));
  } else {
    spacing = Math.max(16, Math.min(24, width * 0.01));
  }

  let columns: number;
  let cardWidth: number;
  let cardHeight: number;

  switch (deviceType) {
    case "mobile":
      columns = isPortrait ? 3 : 4;
      cardWidth = (width - spacing * (columns + 1)) / columns;
      cardHeight = cardWidth * 1.4;
      break;

    case "tablet":
      columns = isPortrait ? 3 : 5;
      cardWidth = (width - spacing * (columns + 1)) / columns;
      cardHeight = cardWidth * 1.4;
      break;

    case "tv":
    default:
      columns = 5;
      const baseCardWidth = 160;
      const maxCardWidth = width * 0.15;
      cardWidth = Math.min(baseCardWidth, maxCardWidth);
      cardHeight = cardWidth * 1.5;
      break;
  }

  return {
    deviceType,
    columns,
    cardWidth,
    cardHeight,
    spacing,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    scale,
    fontScale,
  };
};

export const useResponsiveLayout = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isPortrait = height > width;
  const deviceType = getDeviceType(width);

  return getLayoutConfig(deviceType, width, height, isPortrait);
};

// Utility hook for responsive values
export const useResponsiveValue = <T>(values: { mobile: T; tablet: T; tv: T }): T => {
  const { deviceType } = useResponsiveLayout();
  return values[deviceType];
};

// Utility hook for responsive styles
export const useResponsiveStyles = () => {
  const config = useResponsiveLayout();

  return {
    // Common responsive styles
    container: {
      paddingHorizontal: config.spacing,
      paddingVertical: config.spacing,
    },

    // Card styles
    cardContainer: {
      width: config.cardWidth,
      height: config.cardHeight,
      marginBottom: config.spacing,
      marginHorizontal: config.spacing / 2,
    },

    // Grid styles
    gridContainer: {
      paddingHorizontal: config.spacing / 2,
      paddingTop: config.spacing / 2,
    },

    // Typography
    titleFontSize: config.deviceType === "mobile" ? 18 : config.deviceType === "tablet" ? 22 : 28,
    subtitleFontSize: config.deviceType === "mobile" ? 16 : config.deviceType === "tablet" ? 18 : 24,
    bodyFontSize: config.deviceType === "mobile" ? 14 : config.deviceType === "tablet" ? 16 : 18,
    captionFontSize: config.deviceType === "mobile" ? 12 : config.deviceType === "tablet" ? 14 : 16,

    // Spacing
    sectionSpacing: config.deviceType === "mobile" ? 16 : config.deviceType === "tablet" ? 20 : 24,
    itemSpacing: config.spacing,
    headerSpacing: config.deviceType === "mobile" ? 12 : config.deviceType === "tablet" ? 16 : 20,
    footerSpacing: config.deviceType === "mobile" ? 16 : config.deviceType === "tablet" ? 20 : 24,

    // Touch targets
    minTouchTarget: config.deviceType === "mobile" ? 44 : config.deviceType === "tablet" ? 48 : 56,
  };
};

// Utility function for responsive font sizes
export const responsiveFontSize = (size: number, fontScale: number, deviceType: DeviceType): number => {
  const baseSize = size;
  
  switch (deviceType) {
    case "mobile":
      return baseSize * fontScale;
    case "tablet":
      return baseSize * fontScale * 1.1;
    case "tv":
      return baseSize * fontScale * 1.2;
    default:
      return baseSize * fontScale;
  }
};

// Utility function for responsive spacing
export const responsiveSpacing = (size: number, deviceType: DeviceType): number => {
  const baseSize = size;
  
  switch (deviceType) {
    case "mobile":
      return baseSize * 0.8;
    case "tablet":
      return baseSize;
    case "tv":
      return baseSize * 1.2;
    default:
      return baseSize;
  }
};
