import { useEffect, useRef, useCallback } from "react";
import usePlayerStore from "@/stores/playerStore";
import type { TVKeyEvent } from "@/types/common";

export const useTVEventHandler = (_handler: (event: TVKeyEvent) => void) => {};

const SEEK_STEP = 15 * 1000;
const LONG_SEEK_STEP = 30 * 1000;
const CONTROLS_TIMEOUT = 5000;
const FAST_SEEK_INTERVAL = 150;

export const useTVRemoteHandler = () => {
  const { 
    showControls, 
    setShowControls, 
    showEpisodeModal, 
    showSourceModal,
    showSpeedModal,
    togglePlayPause, 
    seek,
    playPreviousEpisode,
  } = usePlayerStore();

  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const fastSeekIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventTimeRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_TIMEOUT);
  }, [setShowControls]);

  const clearFastSeekInterval = useCallback(() => {
    if (fastSeekIntervalRef.current) {
      clearInterval(fastSeekIntervalRef.current);
      fastSeekIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showControls) {
      resetTimer();
    } else {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    }

    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls, resetTimer]);

  useEffect(() => {
    return () => {
      clearFastSeekInterval();
    };
  }, [clearFastSeekInterval]);

  const handleTVEvent = useCallback(
    (event: TVKeyEvent) => {
      if (showEpisodeModal || showSourceModal || showSpeedModal) {
        return;
      }

      const now = Date.now();
      const isKeyDown = event.eventKeyAction === 0;
      const isKeyUp = event.eventKeyAction === 1;

      if (isKeyUp && (event.eventType === 'longRight' || event.eventType === 'longLeft')) {
        clearFastSeekInterval();
        return;
      }

      if (!isKeyDown) return;

      if (now - lastEventTimeRef.current < 50) {
        return;
      }
      lastEventTimeRef.current = now;

      resetTimer();

      if (showControls) {
        switch (event.eventType) {
          case 'select':
          case 'center':
            togglePlayPause();
            break;
          case 'menu':
          case 'back':
            setShowControls(false);
            break;
        }
        return;
      }

      switch (event.eventType) {
        case 'select':
        case 'center':
          togglePlayPause();
          setShowControls(true);
          break;

        case 'left':
          seek(-SEEK_STEP);
          break;

        case 'longLeft':
          if (!fastSeekIntervalRef.current) {
            fastSeekIntervalRef.current = setInterval(() => {
              seek(-LONG_SEEK_STEP);
            }, FAST_SEEK_INTERVAL);
          }
          break;

        case 'right':
          seek(SEEK_STEP);
          break;

        case 'longRight':
          if (!fastSeekIntervalRef.current) {
            fastSeekIntervalRef.current = setInterval(() => {
              seek(LONG_SEEK_STEP);
            }, FAST_SEEK_INTERVAL);
          }
          break;

        case 'up':
          playPreviousEpisode();
          break;

        case 'down':
          setShowControls(true);
          break;

        case 'fastForward':
          seek(SEEK_STEP * 2);
          break;

        case 'rewind':
          seek(-SEEK_STEP * 2);
          break;

        case 'playPause':
        case 'play':
          togglePlayPause();
          setShowControls(true);
          break;

        case 'menu':
          setShowControls(true);
          break;
      }
    },
    [
      showControls, 
      showEpisodeModal, 
      showSourceModal,
      showSpeedModal,
      setShowControls, 
      resetTimer, 
      togglePlayPause, 
      seek,
      playPreviousEpisode,
      clearFastSeekInterval,
    ]
  );

  useTVEventHandler(handleTVEvent);

  const onScreenPress = () => {
    const newShowControls = !showControls;
    setShowControls(newShowControls);

    if (newShowControls) {
      resetTimer();
    }
  };

  return { onScreenPress };
};
