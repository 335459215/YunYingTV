import React, { useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import useHistoryStore from "@/stores/historyStore";
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
import { Clock, Trash2, XCircle } from "lucide-react-native";
import { StyledButton } from "@/components/StyledButton";
import { Colors, BorderRadius } from "@/constants/Colors";

export default React.memo(function HistoryScreen() {
  const router = useRouter();
  const {
    filteredRecords,
    categories,
    selectedCategory,
    loading,
    error,
    fetchRecords,
    setCategory,
    deleteRecord,
    clearAll,
  } = useHistoryStore();
  const apiConfigStatus = useApiConfig();

  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType, spacing } = responsiveConfig;

  const hasServer = apiConfigStatus.isConfigured && !apiConfigStatus.needsConfiguration;
  const isTV = deviceType === "tv";
  const hasData = filteredRecords.length > 0;

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = useCallback(
    (key: string, title: string) => {
      Alert.alert("删除记录", `确定删除「${title}」的播放记录？`, [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => deleteRecord(key),
        },
      ]);
    },
    [deleteRecord]
  );

  const handleClearAll = () => {
    Alert.alert("清空历史", "确定清空所有播放记录？此操作不可恢复。", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: () => clearAll(),
      },
    ]);
  };

  const dynamicStyles = useMemo(() => createResponsiveStyles(deviceType, spacing), [deviceType, spacing]);

  const renderCategoryChips = () => {
    if (categories.length <= 1) return null;
    return (
      <View style={dynamicStyles.chipsContainer}>
        <Pressable
          style={[
            dynamicStyles.chip,
            !selectedCategory && dynamicStyles.chipActive,
          ]}
          onPress={() => setCategory(null)}
        >
          <ThemedText
            style={[
              dynamicStyles.chipText,
              !selectedCategory && dynamicStyles.chipTextActive,
            ]}
          >
            全部
          </ThemedText>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              dynamicStyles.chip,
              selectedCategory === cat && dynamicStyles.chipActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <ThemedText
              style={[
                dynamicStyles.chipText,
                selectedCategory === cat && dynamicStyles.chipTextActive,
              ]}
            >
              {cat}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof filteredRecords)[0]; index: number }) => {
      const [source, id] = item.key.split("+");
      const progress =
        item.total_time > 0 ? Math.min(1, item.play_time / item.total_time) : 0;

      return (
        <ListItemAnimation index={index} delay={30}>
          <View style={dynamicStyles.cardWrapper}>
            <VideoCard
              id={id}
              source={source}
              title={item.title}
              sourceName={item.source_name}
              poster={item.cover}
              year={item.year}
              api={api}
              episodeIndex={Math.max(1, item.index)}
              progress={progress}
            />
            <Pressable
              style={dynamicStyles.deleteBtn}
              onPress={() => handleDelete(item.key, item.title)}
            >
              <XCircle size={isTV ? 22 : 18} color="#EF4444" />
            </Pressable>
          </View>
        </ListItemAnimation>
      );
    },
    [handleDelete, isTV, dynamicStyles]
  );

  const renderEmptyState = () => (
    <View style={[commonStyles.center, { paddingHorizontal: spacing * 3 }]}>
      <FadeIn duration={500}>
        <View style={{ marginBottom: spacing * 2, opacity: 0.5 }}>
          <Clock size={56} color={Colors.dark.textTertiary} strokeWidth={1.5} />
        </View>
        <ThemedText
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: Colors.dark.text,
            marginBottom: spacing * 0.8,
          }}
        >
          暂无观看记录
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 14,
            color: Colors.dark.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: spacing * 1.5,
          }}
        >
          观看视频后，记录会自动保存在这里
        </ThemedText>
        <StyledButton
          text="去逛逛"
          onPress={() => router.push("/")}
          variant="primary"
          style={{ minWidth: 160 }}
        />
      </FadeIn>
    </View>
  );

  const renderContent = () => (
    <FadeIn duration={400}>
      {isTV && (
        <View style={dynamicStyles.headerRow}>
          <ThemedText style={dynamicStyles.headerTitle}>观看历史</ThemedText>
          {hasData && (
            <Pressable onPress={handleClearAll}>
              <Trash2 size={20} color={Colors.dark.textSecondary} />
            </Pressable>
          )}
        </View>
      )}

      {!hasServer ? (
        renderEmptyState()
      ) : (
        <>
          {renderCategoryChips()}
          <CustomScrollView
            data={filteredRecords}
            renderItem={renderItem}
            loading={loading}
            error={
              error && !(error.includes("API_URL") || error.includes("NOT_SET"))
                ? error
                : undefined
            }
            emptyMessage="暂无观看记录"
          />
        </>
      )}
    </FadeIn>
  );

  const content = (
    <ThemedView style={[commonStyles.container, dynamicStyles.container]}>
      {renderContent()}
    </ThemedView>
  );

  if (deviceType === "tv") {
    return content;
  }

  return (
    <ResponsiveNavigation>
      <ResponsiveHeader title="观看历史" showBackButton />
      {content}
    </ResponsiveNavigation>
  );
});

const createResponsiveStyles = (deviceType: string, spacing: number) => {
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isTV = deviceType === "tv";

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: isTV ? spacing * 2 : 0,
    },
    headerRow: {
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
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: spacing,
      paddingVertical: spacing * 0.6,
      marginBottom: 4,
    },
    chip: {
      paddingHorizontal: isTV ? 18 : 14,
      paddingVertical: isTV ? 10 : 7,
      borderRadius: BorderRadius.full,
      backgroundColor: "#1C1D21",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    chipActive: {
      backgroundColor: "rgba(0, 201, 107, 0.15)",
      borderColor: "rgba(0, 201, 107, 0.40)",
    },
    chipText: {
      fontSize: isTV ? 15 : 13,
      fontWeight: "500",
      color: Colors.dark.textSecondary,
    },
    chipTextActive: {
      color: "#00C96B",
      fontWeight: "600",
    },
    cardWrapper: {
      position: "relative",
    },
    deleteBtn: {
      position: "absolute",
      top: 6,
      right: 6,
      zIndex: 10,
      padding: 4,
      backgroundColor: "rgba(10, 11, 13, 0.85)",
      borderRadius: BorderRadius.full,
    },
  });
};
