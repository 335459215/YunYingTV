import { useCallback, useRef, useEffect } from 'react';
import { Platform, BackHandler } from 'react-native';

type HWEvent = {
  eventType: string;
  eventKeyAction: number;
};

type FocusDirection = 'up' | 'down' | 'left' | 'right';

type TVFocusConfig = {
  onBack?: () => boolean;
  onMenu?: () => boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onForward?: () => void;
  onRewind?: () => void;
  onSelect?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onLongForward?: () => void;
  onLongRewind?: () => void;
  onLongForwardEnd?: () => void;
  onLongRewindEnd?: () => void;
  onNumber?: (num: number) => void;
  enabled?: boolean;
};

const useTVEventHandler = (handler: (event: HWEvent) => void) => {};

export const useTVFocusManager = (config: TVFocusConfig) => {
  const {
    onBack,
    onMenu,
    onPlay,
    onPause,
    onForward,
    onRewind,
    onSelect,
    onUp,
    onDown,
    onLeft,
    onRight,
    onLongForward,
    onLongRewind,
    onLongForwardEnd,
    onLongRewindEnd,
    onNumber,
    enabled = true,
  } = config;

  const longPressActiveRef = useRef<'forward' | 'rewind' | null>(null);

  const handleTVEvent = useCallback(
    (event: HWEvent) => {
      if (!enabled) return;

      const { eventType, eventKeyAction } = event;
      const isKeyDown = eventKeyAction === 0;
      const isKeyUp = eventKeyAction === 1;

      switch (eventType) {
        case 'back':
          if (isKeyDown && onBack) {
            onBack();
          }
          break;

        case 'menu':
          if (isKeyDown && onMenu) {
            onMenu();
          }
          break;

        case 'playPause':
          if (isKeyDown) {
            if (onPlay) onPlay();
            if (onPause) onPause();
          }
          break;

        case 'play':
          if (isKeyDown && onPlay) {
            onPlay();
          }
          break;

        case 'pause':
          if (isKeyDown && onPause) {
            onPause();
          }
          break;

        case 'select':
        case 'center':
          if (isKeyDown && onSelect) {
            onSelect();
          }
          break;

        case 'up':
          if (isKeyDown && onUp) {
            onUp();
          }
          break;

        case 'down':
          if (isKeyDown && onDown) {
            onDown();
          }
          break;

        case 'left':
          if (isKeyDown && onLeft) {
            onLeft();
          }
          break;

        case 'right':
          if (isKeyDown && onRight) {
            onRight();
          }
          break;

        case 'fastForward':
          if (isKeyDown && onForward) {
            onForward();
          }
          break;

        case 'rewind':
          if (isKeyDown && onRewind) {
            onRewind();
          }
          break;

        case 'longRight':
        case 'longFastForward':
          if (isKeyDown) {
            longPressActiveRef.current = 'forward';
            if (onLongForward) onLongForward();
          } else if (isKeyUp && longPressActiveRef.current === 'forward') {
            longPressActiveRef.current = null;
            if (onLongForwardEnd) onLongForwardEnd();
          }
          break;

        case 'longLeft':
        case 'longRewind':
          if (isKeyDown) {
            longPressActiveRef.current = 'rewind';
            if (onLongRewind) onLongRewind();
          } else if (isKeyUp && longPressActiveRef.current === 'rewind') {
            longPressActiveRef.current = null;
            if (onLongRewindEnd) onLongRewindEnd();
          }
          break;

        default:
          if (eventType.startsWith('num') && isKeyDown && onNumber) {
            const num = parseInt(eventType.replace('num', ''), 10);
            if (!isNaN(num)) {
              onNumber(num);
            }
          }
          break;
      }
    },
    [
      enabled,
      onBack,
      onMenu,
      onPlay,
      onPause,
      onForward,
      onRewind,
      onSelect,
      onUp,
      onDown,
      onLeft,
      onRight,
      onLongForward,
      onLongRewind,
      onLongForwardEnd,
      onLongRewindEnd,
      onNumber,
    ]
  );

  useTVEventHandler(handleTVEvent);

  useEffect(() => {
    return () => {
      longPressActiveRef.current = null;
    };
  }, []);

  return {
    isLongPressActive: () => longPressActiveRef.current !== null,
  };
};

export const useTVBackHandler = (handler: () => boolean, enabled = true) => {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => backHandler.remove();
  }, [handler, enabled]);
};

export const createTVFocusStyle = (isFocused: boolean, theme: 'light' | 'dark' = 'dark') => {
  const colors = {
    light: {
      focusedBorder: '#007AFF',
      focusedBg: 'rgba(0, 122, 255, 0.1)',
      focusedShadow: 'rgba(0, 122, 255, 0.5)',
    },
    dark: {
      focusedBorder: '#4A9EFF',
      focusedBg: 'rgba(74, 158, 255, 0.15)',
      focusedShadow: 'rgba(74, 158, 255, 0.6)',
    },
  };

  const themeColors = colors[theme];

  return {
    borderWidth: isFocused ? 3 : 0,
    borderColor: isFocused ? themeColors.focusedBorder : 'transparent',
    backgroundColor: isFocused ? themeColors.focusedBg : 'transparent',
    shadowColor: isFocused ? themeColors.focusedShadow : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isFocused ? 1 : 0,
    shadowRadius: isFocused ? 12 : 0,
    elevation: isFocused ? 8 : 0,
  };
};

export const useTVGridNavigation = <T,>(
  items: T[],
  columns: number,
  onSelect: (index: number) => void,
  enabled = true
) => {
  const currentIndexRef = useRef(0);

  const moveFocus = useCallback(
    (direction: FocusDirection) => {
      if (!enabled || items.length === 0) return;

      const rows = Math.ceil(items.length / columns);
      const currentRow = Math.floor(currentIndexRef.current / columns);
      const currentCol = currentIndexRef.current % columns;

      let newIndex = currentIndexRef.current;

      switch (direction) {
        case 'up':
          if (currentRow > 0) {
            newIndex = currentIndexRef.current - columns;
          }
          break;
        case 'down':
          if (currentRow < rows - 1) {
            const nextIndex = currentIndexRef.current + columns;
            if (nextIndex < items.length) {
              newIndex = nextIndex;
            }
          }
          break;
        case 'left':
          if (currentCol > 0) {
            newIndex = currentIndexRef.current - 1;
          }
          break;
        case 'right':
          if (currentCol < columns - 1 && currentIndexRef.current < items.length - 1) {
            newIndex = currentIndexRef.current + 1;
          }
          break;
      }

      if (newIndex !== currentIndexRef.current) {
        currentIndexRef.current = newIndex;
      }
    },
    [items.length, columns, enabled]
  );

  const selectCurrent = useCallback(() => {
    if (enabled && items.length > 0) {
      onSelect(currentIndexRef.current);
    }
  }, [items.length, onSelect, enabled]);

  const jumpToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        currentIndexRef.current = index;
      }
    },
    [items.length]
  );

  return {
    currentIndex: currentIndexRef.current,
    moveFocus,
    selectCurrent,
    jumpToIndex,
    setCurrentIndex: (index: number) => {
      currentIndexRef.current = index;
    },
  };
};
