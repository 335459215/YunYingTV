import React, { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, Animated, StatusBar, Platform, BackHandler, ToastAndroid } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { api } from "@/services/api";
import VideoCard from "@/components/VideoCard";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings, LogOut, Heart, Clapperboard, Server as ServerIcon, ChevronDown, Clock } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import useHomeStore, { RowItem, Category } from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Server } from "@/services/storage";
import CustomScrollView from "@/components/CustomScrollView";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";
import ResponsiveNavigation from "@/components/navigation/ResponsiveNavigation";
import { useApiConfig } from "@/hooks/useApiConfig";
import { Colors, Shadows, BorderRadius } from "@/constants/Colors";
import { useFadeIn } from "@/hooks/useAnimation";
import { useThrottle } from "@/hooks/usePerformanceOptimize";
import { FadeIn, ListItemAnimation } from "@/components/AnimationEnhanced";

const LOAD_MORE_THRESHOLD = 200;

export default React.memo(function HomeScreen() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);

  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType, spacing } = responsiveConfig;

  const {
    categories,
    selectedCategory,
    contentData,
    loading,
    loadingMore,
    error,
    fetchInitialData,
    loadMoreData,
    selectCategory,
    refreshPlayRecords,
    clearError,
  } = useHomeStore();
  const { isLoggedIn, logout } = useAuthStore();
  const apiConfigStatus = useApiConfig();
  const { servers, currentServer, setActiveServer, loadServers, theme } = useSettingsStore();

  const isTV = deviceType === "tv";
  const hasServer = apiConfigStatus.isConfigured && !apiConfigStatus.needsConfiguration;
  const hasMultipleServers = servers.length > 1;

  const lastTapRef = useRef<number>(0);

  const headerAnim = useFadeIn(0, 500);
  const categoryAnim = useFadeIn(100, 500);
  const contentAnim = useFadeIn(200, 600);

  useFocusEffect(
    useCallback(() => {
      refreshPlayRecords();
      loadServers();
    }, [refreshPlayRecords, loadServers])
  );

  const backPressTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (showServerMenu) {
          setShowServerMenu(false);
          return true;
        }
        const now = Date.now();
        if (!backPressTimeRef.current || now - backPressTimeRef.current > 2000) {
          backPressTimeRef.current = now;
          ToastAndroid.show("再按一次返回键退出", ToastAndroid.SHORT);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };

      if (Platform.OS === "android") {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => {
          backHandler.remove();
          backPressTimeRef.current = null;
        };
      }
    }, [showServerMenu])
  );

  useEffect(() => {
    if (!selectedCategory) return;

    if (selectedCategory.tags && !selectedCategory.tag) {
      const defaultTag = selectedCategory.tags[0];
      setSelectedTag(defaultTag);
      selectCategory({ ...selectedCategory, tag: defaultTag });
      return;
    }

    if (hasServer) {
      if (selectedCategory.tags && selectedCategory.tag) {
        fetchInitialData();
      }
      else if (!selectedCategory.tags) {
        fetchInitialData();
      }
    }
  }, [
    selectedCategory,
    selectedCategory?.tag,
    hasServer,
    fetchInitialData,
    selectCategory,
  ]);

  useEffect(() => {
    if (apiConfigStatus.needsConfiguration && error) {
      clearError();
    }
  }, [apiConfigStatus.needsConfiguration, error, clearError]);

  const onRefresh = useCallback(async () => {
    if (!hasServer) return;
    setRefreshing(true);
    try {
      await fetchInitialData();
    } finally {
      setRefreshing(false);
    }
  }, [hasServer, fetchInitialData]);

  const handleDoubleTapRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onRefresh();
      ToastAndroid.show("正在刷新...", ToastAndroid.SHORT);
    }
    lastTapRef.current = now;
  }, [onRefresh]);

  const throttledCategorySelect = useThrottle((category: Category) => {
    setSelectedTag(null);
    selectCategory(category);
  }, 300);

  const handleCategorySelect = useCallback((category: Category) => {
    throttledCategorySelect(category);
  }, [throttledCategorySelect]);

  const throttledTagSelect = useThrottle((tag: string) => {
    setSelectedTag(tag);
    if (selectedCategory) {
      const categoryWithTag = { ...selectedCategory, tag: tag };
      selectCategory(categoryWithTag);
    }
  }, 300);

  const handleTagSelect = useCallback((tag: string) => {
    throttledTagSelect(tag);
  }, [throttledTagSelect]);

  const handleServerSwitch = useCallback(async (serverId: string) => {
    await setActiveServer(serverId);
    setShowServerMenu(false);
    ToastAndroid.show("已切换服务器", ToastAndroid.SHORT);
  }, [setActiveServer]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="large" color={Colors[theme]?.primary ?? Colors.dark.primary} />
        <ThemedText style={styles.loadMoreText}>加载更多...</ThemedText>
      </View>
    );
  };

  const renderHeader = () => {
    if (deviceType === "mobile") {
      return (
        <Animated.View style={[dynamicStyles.mobileHeader, headerAnim]}>
          <View style={dynamicStyles.mobileHeaderLeft}>
            <Pressable
              style={[dynamicStyles.serverBadge, hasMultipleServers && dynamicStyles.serverBadgeMulti]}
              onPress={() => hasMultipleServers ? setShowServerMenu(!showServerMenu) : router.push("/settings")}
            >
              <ServerIcon size={14} color={hasServer ? (Colors[theme]?.primary ?? Colors.dark.primary) : (Colors[theme]?.textTertiary ?? Colors.dark.textTertiary)} />
              <ThemedText style={[dynamicStyles.serverBadgeText, !hasServer && dynamicStyles.serverBadgeTextInactive]}>
                {currentServer?.name || (hasServer ? "已连接" : "未连接")}
              </ThemedText>
              {(hasMultipleServers || !hasServer) && (
                <ChevronDown size={12} color={Colors[theme]?.textTertiary ?? Colors.dark.textTertiary} />
              )}
            </Pressable>
          </View>
          <View style={dynamicStyles.mobileHeaderRight}>
            <Pressable style={dynamicStyles.iconButton} onPress={() => router.push("/favorites")}>
              <Heart size={20} color={theme === "light" ? "#0D1117" : "#F0F2F5"} />
            </Pressable>
            <Pressable style={dynamicStyles.iconButton} onPress={() => router.push("/history")}>
              <Clock size={20} color={theme === "light" ? "#0D1117" : "#F0F2F5"} />
            </Pressable>
            <Pressable style={dynamicStyles.iconButton} onPress={() => router.push("/search")}>
              <Search size={20} color={theme === "light" ? "#0D1117" : "#F0F2F5"} />
            </Pressable>
          </View>

          {showServerMenu && hasMultipleServers && (
            <Animated.View style={dynamicStyles.serverDropdown}>
              <View style={dynamicStyles.dropdownArrow} />
              {servers.map((server: Server) => (
                <Pressable
                  key={server.id}
                  style={[
                    dynamicStyles.dropdownItem,
                    currentServer?.id === server.id && dynamicStyles.dropdownItemActive,
                  ]}
                  onPress={() => handleServerSwitch(server.id)}
                >
                  <View style={[
                    dynamicStyles.dropdownDot,
                    currentServer?.id === server.id && { backgroundColor: Colors[theme]?.primary ?? Colors.dark.primary },
                  ]} />
                  <ThemedText style={[
                    dynamicStyles.dropdownItemText,
                    currentServer?.id === server.id && dynamicStyles.dropdownItemTextActive,
                  ]}>
                    {server.name}
                  </ThemedText>
                </Pressable>
              ))}
              <Pressable
                style={dynamicStyles.dropdownItem}
                onPress={() => { setShowServerMenu(false); router.push("/settings"); }}
              >
                <ThemedText style={dynamicStyles.dropdownItemAdd}>+ 管理服务器</ThemedText>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[dynamicStyles.headerContainer, headerAnim]}>
        <View style={dynamicStyles.logoContainer}>
          {hasMultipleServers && (
            <Pressable
              style={dynamicStyles.tvServerButton}
              onPress={() => setShowServerMenu(!showServerMenu)}
            >
              <ServerIcon size={isTV ? 18 : 16} color={Colors[theme]?.primary ?? Colors.dark.primary} />
              <ThemedText style={dynamicStyles.tvServerName}>{currentServer?.name || "服务器"}</ThemedText>
              <ChevronDown size={14} color={Colors[theme]?.textSecondary ?? Colors.dark.textSecondary} />
            </Pressable>
          )}
          <View style={styles.logoIconContainer}>
            <Clapperboard size={isTV ? 32 : 24} color={Colors[theme]?.primary ?? Colors.dark.primary} />
          </View>
          <ThemedText style={dynamicStyles.appName}>云影TV</ThemedText>
        </View>
        <View style={dynamicStyles.headerActions}>
          <Pressable
            style={dynamicStyles.liveButton}
            onPress={() => router.push("/live")}
          >
            <View style={dynamicStyles.liveButtonInner}>
              <ThemedText style={dynamicStyles.liveText}>直播</ThemedText>
            </View>
          </Pressable>
          <View style={dynamicStyles.rightHeaderButtons}>
            <StyledButton style={dynamicStyles.iconButton} onPress={() => router.push("/favorites")} variant="ghost">
              <Heart color={theme === "light" ? "#0D1117" : "#F0F2F5"} size={isTV ? 28 : 24} />
            </StyledButton>
            <StyledButton style={dynamicStyles.iconButton} onPress={() => router.push("/history")} variant="ghost">
              <Clock color={theme === "light" ? "#0D1117" : "#F0F2F5"} size={isTV ? 28 : 24} />
            </StyledButton>
            <StyledButton
              style={dynamicStyles.iconButton}
              onPress={() => router.push({ pathname: "/search" })}
              variant="ghost"
            >
              <Search color={theme === "light" ? "#0D1117" : "#F0F2F5"} size={isTV ? 28 : 24} />
            </StyledButton>
            <StyledButton style={dynamicStyles.iconButton} onPress={() => router.push("/settings")} variant="ghost">
              <Settings color={theme === "light" ? "#0D1117" : "#F0F2F5"} size={isTV ? 28 : 24} />
            </StyledButton>
            {isLoggedIn && (
              <StyledButton style={dynamicStyles.iconButton} onPress={logout} variant="ghost">
                <LogOut color={theme === "light" ? "#0D1117" : "#F0F2F5"} size={isTV ? 28 : 24} />
              </StyledButton>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme]?.background ?? Colors.dark.background,
      paddingTop: 36,
    },
    mobileHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: spacing,
      height: insets.top + 36,
      paddingTop: Math.max(0, insets.top - 32),
      backgroundColor: Colors[theme]?.background ?? Colors.dark.background,
    },
    mobileHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    mobileHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    serverBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[theme]?.card ?? Colors.dark.card,
      borderRadius: BorderRadius.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: Colors[theme]?.border ?? Colors.dark.border,
    },
    serverBadgeMulti: {
      borderColor: Colors[theme]?.borderStrong ?? Colors.dark.borderStrong,
    },
    serverBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors[theme]?.primary ?? Colors.dark.primary,
      marginHorizontal: 4,
    },
    serverBadgeTextInactive: {
      color: Colors[theme]?.textTertiary ?? Colors.dark.textTertiary,
    },
    iconButton: {
      padding: 6,
      marginLeft: 4,
      borderRadius: BorderRadius.sm,
    },
    serverDropdown: {
      position: "absolute",
      top: "100%",
      left: spacing,
      marginTop: 4,
      backgroundColor: Colors[theme]?.surfaceElevated ?? Colors.dark.surfaceElevated,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors[theme]?.borderStrong ?? Colors.dark.borderStrong,
      ...Shadows.dark.lg,
      zIndex: 100,
      minWidth: 180,
      paddingVertical: 4,
    },
    dropdownArrow: {
      position: "absolute",
      top: -8,
      left: 20,
      width: 16,
      height: 16,
      backgroundColor: Colors[theme]?.surfaceElevated ?? Colors.dark.surfaceElevated,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderColor: Colors[theme]?.borderStrong ?? Colors.dark.borderStrong,
      transform: [{ rotate: "45deg" }],
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    dropdownItemActive: {
      backgroundColor: Colors[theme]?.focusGlow ?? Colors.dark.focusGlow,
    },
    dropdownDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: Colors[theme]?.textTertiary ?? Colors.dark.textTertiary,
      marginRight: 10,
    },
    dropdownItemText: {
      fontSize: 14,
      color: Colors[theme]?.text ?? Colors.dark.text,
    },
    dropdownItemTextActive: {
      color: Colors[theme]?.primary ?? Colors.dark.primary,
      fontWeight: "600",
    },
    dropdownItemAdd: {
      fontSize: 13,
      color: Colors[theme]?.primary ?? Colors.dark.primary,
      fontWeight: "600",
    },
    tvServerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[theme]?.surfaceElevated ?? Colors.dark.surfaceElevated,
      borderRadius: BorderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 12,
      borderWidth: 1,
      borderColor: Colors[theme]?.border ?? Colors.dark.border,
    },
    tvServerName: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[theme]?.text ?? Colors.dark.text,
      marginHorizontal: 6,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing * 1.5,
      marginBottom: spacing,
      minHeight: isTV ? 70 : 50,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    appName: {
      fontSize: isTV ? 32 : 22,
      fontWeight: "800",
      color: Colors[theme]?.primary ?? Colors.dark.primary,
      marginLeft: 12,
      letterSpacing: 1,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    liveButton: {
      marginRight: spacing,
    },
    liveButtonInner: {
      backgroundColor: Colors[theme]?.primary ?? Colors.dark.primary,
      paddingHorizontal: isTV ? 28 : 18,
      paddingVertical: isTV ? 14 : 10,
      borderRadius: isTV ? 14 : 10,
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: Colors[theme]?.primary ?? Colors.dark.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    liveText: {
      fontSize: isTV ? 18 : 15,
      fontWeight: "700",
      color: "#ffffff",
    },
    rightHeaderButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButtonTV: {
      borderRadius: 30,
      marginLeft: spacing / 2,
      minWidth: isTV ? 56 : 44,
      minHeight: isTV ? 56 : 44,
    },
    categoryContainer: {
      paddingBottom: spacing / 2,
    },
    categoryListContent: {
      paddingHorizontal: spacing,
    },
    categoryButton: {
      paddingHorizontal: isTV ? 24 : deviceType === "mobile" ? 14 : 18,
      paddingVertical: isTV ? 16 : spacing / 2,
      borderRadius: isTV ? 14 : deviceType === "mobile" ? BorderRadius.md : 10,
      marginHorizontal: isTV ? 8 : spacing / 2,
      minWidth: isTV ? 110 : 70,
    },
    categoryText: {
      fontSize: isTV ? 18 : deviceType === "mobile" ? 15 : 16,
      fontWeight: "600",
    },
    contentContainer: {
      flex: 1,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing * 3,
      paddingBottom: spacing * 4,
    },
    emptyStateIcon: {
      marginBottom: spacing * 2.5,
      alignItems: "center",
      justifyContent: "center",
    },
    iconGlowRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(0, 201, 107, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing * 2,
    },
    emptyIconWrapper: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing * 2.5,
    },
    emptyStateTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: Colors.dark.text,
      textAlign: "center",
      marginBottom: spacing * 0.6,
      letterSpacing: 1,
    },
    emptyStateDesc: {
      fontSize: 14,
      color: Colors.dark.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing * 2,
    },
  }), [deviceType, spacing, insets, isTV, theme]);

  const renderCategory = useCallback(({ item }: { item: Category }) => {
    const isSelected = selectedCategory?.title === item.title;
    return (
      <StyledButton
        text={item.title}
        onPress={() => handleCategorySelect(item)}
        isSelected={isSelected}
        style={dynamicStyles.categoryButton}
        textStyle={dynamicStyles.categoryText}
      />
    );
  }, [selectedCategory?.title, handleCategorySelect, dynamicStyles.categoryButton, dynamicStyles.categoryText]);

  const renderContentItem = useCallback(({ item, index }: { item: RowItem; index: number }) => (
    <ListItemAnimation index={index} delay={20}>
      <VideoCard
        id={item.id}
        source={item.source}
        title={item.title}
        poster={item.poster}
        year={item.year}
        rate={item.rate}
        progress={item.progress}
        playTime={item.play_time}
        episodeIndex={item.episodeIndex}
        sourceName={item.sourceName}
        totalEpisodes={item.totalEpisodes}
        api={api}
        onRecordDeleted={fetchInitialData}
        index={index}
      />
    </ListItemAnimation>
  ), [fetchInitialData]);

  const renderTagItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const isSelected = selectedTag === item;
    return (
      <StyledButton
        hasTVPreferredFocus={index === 0}
        text={item}
        onPress={() => handleTagSelect(item)}
        isSelected={isSelected}
        style={dynamicStyles.categoryButton}
        textStyle={dynamicStyles.categoryText}
        variant="ghost"
      />
    );
  }, [selectedTag, handleTagSelect, dynamicStyles.categoryButton, dynamicStyles.categoryText]);

  const renderEmptyState = () => (
    <View style={dynamicStyles.emptyStateContainer}>
      <View style={dynamicStyles.emptyIconWrapper}>
        <Clapperboard size={42} color={Colors.dark.primary} strokeWidth={1.4} />
      </View>
      <ThemedText style={dynamicStyles.emptyStateTitle}>欢迎使用云影TV</ThemedText>
      <ThemedText style={dynamicStyles.emptyStateDesc}>请先添加视频源服务器地址，即可开始浏览精彩内容</ThemedText>
      <StyledButton text="前往设置" onPress={() => router.push("/settings")} variant="primary" style={{ minWidth: 160 }} />
    </View>
  );

  const content = (
    <ThemedView
      style={[commonStyles.container, dynamicStyles.container]}
      onTouchEnd={handleDoubleTapRefresh}
    >
      {deviceType === "mobile" && (
        <StatusBar
          barStyle={theme === "light" ? "dark-content" : "light-content"}
          backgroundColor={theme === "light" ? "#FAFBFC" : "#0A0B0D"}
          translucent={theme === "glass"}
        />
      )}

      {renderHeader()}

      {hasServer && (
        <FadeIn delay={100} duration={500}>
          <Animated.View style={[dynamicStyles.categoryContainer, categoryAnim]}>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.title}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.categoryListContent}
              removeClippedSubviews={true}
              maxToRenderPerBatch={isTV ? 4 : 6}
              windowSize={isTV ? 4 : 2}
              initialNumToRender={isTV ? 4 : 3}
            />
          </Animated.View>
        </FadeIn>
      )}

      {hasServer && selectedCategory && selectedCategory.tags && (
        <FadeIn delay={200} duration={500}>
          <Animated.View style={[dynamicStyles.categoryContainer, categoryAnim]}>
            <FlatList
              data={selectedCategory.tags}
              renderItem={renderTagItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.categoryListContent}
              removeClippedSubviews={true}
              maxToRenderPerBatch={isTV ? 4 : 6}
              windowSize={isTV ? 4 : 2}
              initialNumToRender={isTV ? 4 : 3}
            />
          </Animated.View>
        </FadeIn>
      )}

      {!hasServer ? (
        renderEmptyState()
      ) : apiConfigStatus.isValidating ? (
        <View style={commonStyles.center}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : loading ? (
        <View style={commonStyles.center}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText style={styles.loadingText}>正在加载...</ThemedText>
        </View>
      ) : error ? (
        <View style={commonStyles.center}>
          <ThemedText type="subtitle" style={{ padding: spacing }}>
            {error}
          </ThemedText>
          <StyledButton
            text="重试"
            onPress={onRefresh}
            variant="secondary"
            style={{ marginTop: spacing }}
          />
        </View>
      ) : (
        <Animated.View style={[dynamicStyles.contentContainer, contentAnim]}>
          <CustomScrollView
            data={contentData}
            renderItem={renderContentItem}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            onEndReached={loadMoreData}
            loadMoreThreshold={LOAD_MORE_THRESHOLD}
            emptyMessage={selectedCategory?.tags ? "请选择一个子分类" : "该分类下暂无内容"}
            ListFooterComponent={renderFooter}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </Animated.View>
      )}
    </ThemedView>
  );

  if (deviceType === "tv") {
    return content;
  }

  return <ResponsiveNavigation>{content}</ResponsiveNavigation>;
});

const styles = StyleSheet.create({
  logoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0, 201, 107, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadMoreContainer: {
    marginVertical: 24,
    alignItems: "center",
  },
  loadMoreText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.dark.textTertiary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});
