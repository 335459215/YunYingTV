import React, { useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import useFavoritesStore from "@/stores/favoritesStore";
import { Favorite } from "@/services/storage";
import VideoCard from "@/components/VideoCard";
import { api } from "@/services/api";
import CustomScrollView from "@/components/CustomScrollView";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";
import ResponsiveNavigation from "@/components/navigation/ResponsiveNavigation";
import ResponsiveHeader from "@/components/navigation/ResponsiveHeader";
import { FadeIn, ListItemAnimation } from "@/components/AnimationEnhanced";
import { useApiConfig } from "@/hooks/useApiConfig";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import { Colors } from "@/constants/Colors";

export default React.memo(function FavoritesScreen() {
  const router = useRouter();
  const { favorites, loading, error, fetchFavorites } = useFavoritesStore();
  const apiConfigStatus = useApiConfig();

  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType, spacing } = responsiveConfig;

  const hasServer = apiConfigStatus.isConfigured && !apiConfigStatus.needsConfiguration;
  const isTV = deviceType === 'tv';

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const renderItem = useCallback(({ item, index }: { item: Favorite & { key: string }; index: number }) => {
    const [source, id] = item.key.split("+");
    return (
      <ListItemAnimation index={index} delay={30}>
        <VideoCard
          id={id}
          source={source}
          title={item.title}
          sourceName={item.source_name}
          poster={item.cover}
          year={item.year}
          api={api}
          episodeIndex={1}
          progress={0}
        />
      </ListItemAnimation>
    );
  }, []);

  const dynamicStyles = useMemo(() => createResponsiveStyles(deviceType, spacing), [deviceType, spacing]);

  // 无服务器时的友好空状态
  const renderEmptyState = () => {
    if (!hasServer) {
      return (
        <View style={[commonStyles.center, { paddingHorizontal: spacing * 3 }]}>
          <FadeIn duration={500}>
            <View style={{ marginBottom: spacing * 2, opacity: 0.5 }}>
              <Heart size={56} color={Colors.dark.textTertiary} strokeWidth={1.5} />
            </View>
            <ThemedText style={{ fontSize: 20, fontWeight: '700', color: Colors.dark.text, marginBottom: spacing * 0.8 }}>
              暂无收藏
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing * 1.5 }}>
              请先添加视频源服务器，浏览并收藏您喜欢的内容
            </ThemedText>
            <StyledButton
              text="前往设置"
              onPress={() => router.push("/settings")}
              variant="primary"
              style={{ minWidth: 160 }}
            />
          </FadeIn>
        </View>
      );
    }

    return (
      <View style={[commonStyles.center, { paddingHorizontal: spacing * 3 }]}>
        <FadeIn duration={400}>
          <View style={{ marginBottom: spacing * 1.5, opacity: 0.4 }}>
            <Heart size={48} color={Colors.dark.textTertiary} strokeWidth={1.5} />
          </View>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', color: Colors.dark.text, marginBottom: spacing * 0.6 }}>
            暂无收藏内容
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: Colors.dark.textSecondary }}>
            浏览视频时点击收藏按钮即可添加到这里
          </ThemedText>
        </FadeIn>
      </View>
    );
  };

  const renderContent = () => (
    <FadeIn duration={400}>
      {isTV && (
        <View style={dynamicStyles.headerContainer}>
          <ThemedText style={dynamicStyles.headerTitle}>我的收藏</ThemedText>
        </View>
      )}
      {!hasServer ? (
        renderEmptyState()
      ) : (
        <CustomScrollView
          data={favorites}
          renderItem={renderItem}
          loading={loading}
          error={error ? (error.includes('API_URL') || error.includes('NOT_SET') ? null : error) : undefined}
          emptyMessage="暂无收藏"
        />
      )}
    </FadeIn>
  );

  const content = (
    <ThemedView style={[commonStyles.container, dynamicStyles.container]}>
      {renderContent()}
    </ThemedView>
  );

  if (deviceType === 'tv') {
    return content;
  }

  return (
    <ResponsiveNavigation>
      <ResponsiveHeader title="我的收藏" showBackButton />
      {content}
    </ResponsiveNavigation>
  );
});

const createResponsiveStyles = (deviceType: string, spacing: number) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isTV = deviceType === 'tv';

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: isTV ? spacing * 2 : 0,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing * 1.5,
      marginBottom: spacing / 2,
    },
    headerTitle: {
      fontSize: isMobile ? 24 : isTablet ? 28 : 32,
      fontWeight: "700",
      paddingTop: spacing,
      color: Colors.dark.text,
    },
  });
};
