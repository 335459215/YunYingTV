import type { LucideIcon } from 'lucide-react-native';

export interface TVKeyEvent {
  eventType: 'up' | 'down' | 'left' | 'right' | 'select' | 'playPause' | 'fastForward' | 'rewind'
    | 'play' | 'menu' | 'back' | 'center'
    | 'longLeft' | 'longRight';
  eventKeyAction?: number;
}

export interface InsetsLike {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type DeviceType = 'mobile' | 'tablet' | 'tv';

export interface ResponsiveConfig {
  deviceType: DeviceType;
  spacing: number;
  isMobile: boolean;
  isTablet: boolean;
  isTV: boolean;
}

export interface VideoPlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  durationMillis: number;
  positionMillis: number;
  playableDurationMillis: number;
  seekMillisToleranceBefore: number;
  seekMillisToleranceAfter: number;
  shouldPlay: boolean;
  isMuted: boolean;
  volume: number;
  rate: number;
  isBuffering: boolean;
  isLooping: boolean;
  didJustFinish: boolean;
}

export interface VideoError {
  error: string;
  message?: string;
}

export interface ListItem {
  id: string | number;
  [key: string]: unknown;
}

export type IconComponentType = LucideIcon;
