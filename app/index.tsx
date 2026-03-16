import React, { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, Animated, StatusBar, Platform, BackHandler, ToastAndroid } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { api } from "@/services/api";
import VideoCard from "@/components/VideoCard";
import { useFocusEffect, useRouter } from "expo-router";
import { Search, Settings, LogOut, Heart, Tv } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import useHomeStore, { RowItem, Category } from "@/stores/homeStore";
import useAuthStore from "@/stores/authStore";
import CustomScrollView from "@/components/CustomScrollView";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";
import ResponsiveNavigation from "@/components/navigation/ResponsiveNavigation";
import { useApiConfig } from "@/hooks/useApiConfig";
import { Colors } from "@/constants/Colors";
import { useFadeIn } from "@/hooks/useAnimation";
import { useDebounce, useThrottle } from "@/hooks/usePerformanceOptimize";
import { FadeIn, ListItemAnimation } from "@/components/AnimationEnhanced";

const LOAD_MORE_THRESHOLD = 200;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = "dark";
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

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

  // 使用新的动画系统
  const headerAnim = useFadeIn(0, 500);
  const categoryAnim = useFadeIn(100, 500);
  const contentAnim = useFadeIn(200, 600);

  useFocusEffect(
    useCallback(() => {
      refreshPlayRecords();
    }, [refreshPlayRecords])
  );

  const backPressTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
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
    }, [])
  );

  useEffect(() => {
    if (!selectedCategory) return;

    if (selectedCategory.tags && !selectedCategory.tag) {
      const defaultTag = selectedCategory.tags[0];
      setSelectedTag(defaultTag);
      selectCategory({ ...selectedCategory, tag: defaultTag });
      return;
    }

    if (apiConfigStatus.isConfigured && !apiConfigStatus.needsConfiguration) {
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
    apiConfigStatus.isConfigured,
    apiConfigStatus.needsConfiguration,
    fetchInitialData,
    selectCategory,
  ]);

  useEffect(() => {
    if (apiConfigStatus.needsConfiguration && error) {
      clearError();
    }
  }, [apiConfigStatus.needsConfiguration, error, clearError]);

  // 使用节流优化分类选择
  const throttledCategorySelect = useThrottle((category: Category) => {
    setSelectedTag(null);
    selectCategory(category);
  }, 300);

  const handleCategorySelect = (category: Category) => {
    throttledCategorySelect(category);
  };

  // 使用节流优化标签选择
  const throttledTagSelect = useThrottle((tag: string) => {
    setSelectedTag(tag);
    if (selectedCategory) {
      const categoryWithTag = { ...selectedCategory, tag: tag };
      selectCategory(categoryWithTag);
    }
  }, 300);

  const handleTagSelect = (tag: string) => {
    throttledTagSelect(tag);
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => {
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
  };

  const renderContentItem = ({ item, index }: { item: RowItem; index: number }) => (
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
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <ThemedText style={styles.loadMoreText}>加载更多...</ThemedText>
      </View>
    );
  };

  const isTV = deviceType === "tv";

  const renderHeader = () => {
    if (deviceType === "mobile") {
      return null;
    }

    return (
      <Animated.View style={[dynamicStyles.headerContainer, headerAnim]}>
        <View style={dynamicStyles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Tv size={isTV ? 32 : 24} color={Colors.dark.primary} />
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
              <Heart color={colorScheme === "dark" ? "white" : "black"} size={isTV ? 28 : 24} />
            </StyledButton>
            <StyledButton
              style={dynamicStyles.iconButton}
              onPress={() => router.push({ pathname: "/search" })}
              variant="ghost"
            >
              <Search color={colorScheme === "dark" ? "white" : "black"} size={isTV ? 28 : 24} />
            </StyledButton>
            <StyledButton style={dynamicStyles.iconButton} onPress={() => router.push("/settings")} variant="ghost">
              <Settings color={colorScheme === "dark" ? "white" : "black"} size={isTV ? 28 : 24} />
            </StyledButton>
            {isLoggedIn && (
              <StyledButton style={dynamicStyles.iconButton} onPress={logout} variant="ghost">
                <LogOut color={colorScheme === "dark" ? "white" : "black"} size={isTV ? 28 : 24} />
              </StyledButton>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: deviceType === "mobile" ? insets.top : deviceType === "tablet" ? insets.top + 20 : 40,
      backgroundColor: Colors.dark.background,
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
      color: Colors.dark.primary,
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
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: isTV ? 28 : 18,
      paddingVertical: isTV ? 14 : 10,
      borderRadius: isTV ? 14 : 10,
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: Colors.dark.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    liveText: {
      fontSize: isTV ? 18 : 15,
      fontWeight: "700",
      color: "white",
    },
    rightHeaderButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
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
      borderRadius: isTV ? 14 : deviceType === "mobile" ? 8 : 10,
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
  });

  const content = (
    <ThemedView style={[commonStyles.container, dynamicStyles.container]}>
      {deviceType === "mobile" && <StatusBar barStyle="light-content" />}

      {renderHeader()}

      <FadeIn delay={100} duration={500}>
        <Animated.View style={[dynamicStyles.categoryContainer, categoryAnim]}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dynamicStyles.categoryListContent}
          />
        </Animated.View>
      </FadeIn>

      {selectedCategory && selectedCategory.tags && (
        <FadeIn delay={200} duration={500}>
          <Animated.View style={[dynamicStyles.categoryContainer, categoryAnim]}>
            <FlatList
              data={selectedCategory.tags}
              renderItem={({ item, index }) => {
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
              }}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.categoryListContent}
            />
          </Animated.View>
        </FadeIn>
      )}

      {apiConfigStatus.isValidating ? (
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
          />
        </Animated.View>
      )}
    </ThemedView>
  );

  if (deviceType === "tv") {
    return content;
  }

  return <ResponsiveNavigation>{content}</ResponsiveNavigation>;
}

const styles = StyleSheet.create({
  logoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0, 187, 94, 0.15)",
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
    color: "#888",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
  },
});
