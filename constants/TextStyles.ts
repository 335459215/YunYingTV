/**
 * Text styles for the app
 * This file defines the text styles for different device types and use cases
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
  // Base scale factor based on device type
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
    // Headings
    h1: {
      fontSize: 36 * finalScale,
      fontWeight: 'bold',
      lineHeight: 44 * finalScale,
    },
    h2: {
      fontSize: 32 * finalScale,
      fontWeight: 'bold',
      lineHeight: 40 * finalScale,
    },
    h3: {
      fontSize: 28 * finalScale,
      fontWeight: 'bold',
      lineHeight: 36 * finalScale,
    },
    h4: {
      fontSize: 24 * finalScale,
      fontWeight: 'bold',
      lineHeight: 32 * finalScale,
    },
    h5: {
      fontSize: 20 * finalScale,
      fontWeight: 'bold',
      lineHeight: 28 * finalScale,
    },
    h6: {
      fontSize: 18 * finalScale,
      fontWeight: 'bold',
      lineHeight: 24 * finalScale,
    },
    
    // Title styles
    title1: {
      fontSize: 28 * finalScale,
      fontWeight: 'bold',
      lineHeight: 36 * finalScale,
    },
    title2: {
      fontSize: 22 * finalScale,
      fontWeight: '600',
      lineHeight: 28 * finalScale,
    },
    title3: {
      fontSize: 20 * finalScale,
      fontWeight: '600',
      lineHeight: 26 * finalScale,
    },
    
    // Body text
    body: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
    },
    bodyBold: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: '600',
    },
    bodySmall: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
    },
    bodySmallBold: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: '600',
    },
    
    // Caption text
    caption: {
      fontSize: 12 * finalScale,
      lineHeight: 16 * finalScale,
    },
    captionBold: {
      fontSize: 12 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: '600',
    },
    
    // Subtitle text
    subtitle: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      color: '#9BA1A6',
    },
    subtitleBold: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: '600',
      color: '#9BA1A6',
    },
    
    // Button text
    button: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: '600',
    },
    buttonSmall: {
      fontSize: 14 * finalScale,
      lineHeight: 20 * finalScale,
      fontWeight: '600',
    },
    buttonLarge: {
      fontSize: 18 * finalScale,
      lineHeight: 28 * finalScale,
      fontWeight: '600',
    },
    
    // Link text
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
    
    // Navigation text
    navItem: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: '500',
    },
    navItemActive: {
      fontSize: 16 * finalScale,
      lineHeight: 24 * finalScale,
      fontWeight: '600',
    },
    
    // Tab text
    tab: {
      fontSize: 11 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: '500',
    },
    tabActive: {
      fontSize: 11 * finalScale,
      lineHeight: 16 * finalScale,
      fontWeight: '600',
    },
  };
};

// Default text styles for mobile
export const defaultTextStyles = getTextStyles(1, '#0a7ea4', 'mobile');

// Text styles for tablet
export const tabletTextStyles = getTextStyles(1, '#0a7ea4', 'tablet');

// Text styles for TV
export const tvTextStyles = getTextStyles(1, '#0a7ea4', 'tv');
