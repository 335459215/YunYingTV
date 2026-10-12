import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router, useRootNavigationState } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import LoginModal from "@/components/LoginModal";
import useAuthStore from "@/stores/authStore";
import { useUpdateStore, initUpdateStore } from "@/stores/updateStore";
import { UpdateModal } from "@/components/UpdateModal";
import { UPDATE_CONFIG } from "@/constants/UpdateConfig";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useThemeColor } from "@/hooks/useThemeColor";
import historyManager, { ContinuationItem } from "@/services/historyManager";
import Logger from '@/utils/Logger';

const logger = Logger.withTag('RootLayout');
const APP_BOOT_TIMEOUT_MS = 8000;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  logger.warn("Splash screen was already prevented from auto-hiding");
});

// Set system UI background color for edge-to-edge display on Android
if (Platform.OS === "android") {
  SystemUI.setBackgroundColorAsync(Colors.dark.background).catch((error) => {
    logger.warn("Failed to set system UI background:", error);
  });
}

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T,
  label: string,
): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutHandle = setTimeout(() => {
          logger.warn(`${label} timed out after ${timeoutMs}ms`);
          resolve(fallbackValue);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export default function RootLayout() {
  const navigationState = useRootNavigationState();
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRouteHandled, setInitialRouteHandled] = useState(false);
  const [pendingContinuation, setPendingContinuation] = useState<ContinuationItem | null>(null);
  const { loadSettings, remoteInputEnabled, apiBaseUrl, theme } = useSettingsStore();
  const { startServer, stopServer } = useRemoteControlStore();
  const { checkLoginStatus } = useAuthStore();
  const { checkForUpdate, lastCheckTime } = useUpdateStore();
  const responsiveConfig = useResponsiveLayout();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        await Promise.all([
          initUpdateStore().catch((error) => {
            logger.error("Failed to initialize update store:", error);
          }),
          withTimeout(loadSettings(), APP_BOOT_TIMEOUT_MS, undefined, "loadSettings"),
        ]);

        const { autoContinuePlayback } = useSettingsStore.getState();
        if (!autoContinuePlayback) {
          logger.info("Auto continue playback is disabled");
          return;
        }

        logger.info("Auto continue playback is enabled, checking for unfinished records");
        try {
          const continuationItem = await withTimeout(
            historyManager.getContinuationItem(),
            APP_BOOT_TIMEOUT_MS,
            null,
            "getContinuationItem",
          );

          if (isMounted && continuationItem) {
            logger.info(`Found continuation item: ${continuationItem.title}`);
            setPendingContinuation(continuationItem);
          } else if (isMounted) {
            logger.info("No unfinished play records found");
          }
        } catch (error) {
          if ((error as Error).message === 'API_URL_NOT_SET') {
            logger.debug('API not configured yet, skipping continuation check');
          } else {
            logger.error("Failed to check for continuation items:", error);
          }
        }
      } catch (error) {
        logger.error("App initialization failed:", error);
      } finally {
        if (isMounted) {
          setIsAppReady(true);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [loadSettings]);

  useEffect(() => {
    if (isAppReady && apiBaseUrl) {
      checkLoginStatus(apiBaseUrl);
    }
  }, [apiBaseUrl, checkLoginStatus, isAppReady]);

  useEffect(() => {
    if (isAppReady && navigationState?.key) {
      SplashScreen.hideAsync().catch((error) => {
        logger.warn("Failed to hide splash screen:", error);
      });
    }
  }, [isAppReady, navigationState?.key]);

  useEffect(() => {
    const forceHideTimeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        logger.warn("Force hide splash screen timeout reached");
      });
    }, 10000);
    return () => clearTimeout(forceHideTimeout);
  }, []);

  useEffect(() => {
    if (!isAppReady || !navigationState?.key || initialRouteHandled) {
      return;
    }

    let autoPlayTimeout: NodeJS.Timeout | null = null;

    if (pendingContinuation) {
      // 添加300ms延迟，允许用户通过返回手势或按钮打断自动续播
      autoPlayTimeout = setTimeout(() => {
        router.replace({
          pathname: "/play",
          params: {
            episodeIndex: pendingContinuation.index.toString(),
            position: (pendingContinuation.play_time * 1000).toString(),
            source: pendingContinuation.source,
            id: pendingContinuation.id,
            title: pendingContinuation.title,
          },
        });
        setInitialRouteHandled(true);
      }, 300);
    } else {
      setInitialRouteHandled(true);
    }

    return () => {
      if (autoPlayTimeout) {
        clearTimeout(autoPlayTimeout);
      }
    };
  }, [initialRouteHandled, isAppReady, navigationState?.key, pendingContinuation]);

  // 检查更新
  useEffect(() => {
    if (
      isAppReady &&
      UPDATE_CONFIG.AUTO_CHECK &&
      Boolean(UPDATE_CONFIG.GITHUB_RAW_URL) &&
      Platform.OS === "android"
    ) {
      // 检查是否需要自动检查更新
      const shouldCheck = Date.now() - lastCheckTime > UPDATE_CONFIG.CHECK_INTERVAL;
      if (shouldCheck) {
        checkForUpdate(true); // 静默检查
      }
    }
  }, [checkForUpdate, isAppReady, lastCheckTime]);

  useEffect(() => {
    if (Platform.OS === "android" && theme) {
      const bg = Colors[theme]?.background ?? Colors.dark.background;
      SystemUI.setBackgroundColorAsync(bg).catch(() => {});
    }
  }, [theme]);

  useEffect(() => {
    // 只有在非手机端才启动远程控制服务器
    if (remoteInputEnabled && responsiveConfig.deviceType !== "mobile") {
      startServer();
    } else {
      stopServer();
    }
  }, [remoteInputEnabled, startServer, stopServer, responsiveConfig.deviceType]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={theme === "light" ? DefaultTheme : DarkTheme}>
          <View style={[styles.container, { backgroundColor }]}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="detail" options={{ headerShown: false, gestureEnabled: true }} />
              {Platform.OS !== "web" && <Stack.Screen name="play" options={{ headerShown: false, gestureEnabled: true }} />}
              <Stack.Screen name="search" options={{ headerShown: false, gestureEnabled: true }} />
              <Stack.Screen name="live" options={{ headerShown: false, gestureEnabled: true }} />
              <Stack.Screen name="settings" options={{ headerShown: false, gestureEnabled: true }} />
              <Stack.Screen name="favorites" options={{ headerShown: false, gestureEnabled: true }} />
              <Stack.Screen name="history" options={{ headerShown: false, gestureEnabled: true }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
          <Toast />
          <LoginModal />
          <UpdateModal />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
