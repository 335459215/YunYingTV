import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, BackHandler, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";

function groupItemsByRow<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
}

interface CustomScrollViewProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
  numColumns?: number;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  onEndReached?: () => void;
  loadMoreThreshold?: number;
  emptyMessage?: string;
  ListFooterComponent?: React.ComponentType<Record<string, never>> | React.ReactElement | null;
}

const CustomScrollView = <T,>({
  data,
  renderItem,
  numColumns,
  loading = false,
  loadingMore = false,
  error = null,
  onEndReached,
  loadMoreThreshold = 200,
  emptyMessage = "暂无内容",
  ListFooterComponent,
}: CustomScrollViewProps<T>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const firstCardRef = useRef<{ focus?: () => void } | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType } = responsiveConfig;

  // 添加返回键处理逻辑
  useEffect(() => {
    if (deviceType === 'tv') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showScrollToTop) {
          scrollToTop();
          return true; // 阻止默认的返回行为
        }
        return false; // 允许默认的返回行为
      });

      return () => backHandler.remove();
    }
  }, [deviceType, showScrollToTop]);

  // 使用响应式列数，如果没有明确指定的话
  const effectiveColumns = numColumns || responsiveConfig.columns;

  const rows = useMemo(() => groupItemsByRow(data, effectiveColumns), [data, effectiveColumns]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    listContent: {
      paddingBottom: responsiveConfig.spacing * 2,
      paddingHorizontal: responsiveConfig.spacing,
    },
    rowContainer: {
      flexDirection: "row",
      marginBottom: responsiveConfig.spacing,
      justifyContent: "flex-start",
    },
    fullRowContainer: {
      justifyContent: "space-between",
    },
    partialRowContainer: {
      justifyContent: "flex-start",
    },
    itemContainer: {
      width: responsiveConfig.cardWidth,
      marginRight: responsiveConfig.spacing,
    },
    lastItemContainer: {
      width: responsiveConfig.cardWidth,
      marginRight: 0,
    },
    scrollToTopButton: {
      position: 'absolute',
      right: responsiveConfig.spacing,
      bottom: responsiveConfig.spacing * 2,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: responsiveConfig.spacing,
      borderRadius: responsiveConfig.spacing,
      opacity: showScrollToTop ? 1 : 0,
    },
  }), [responsiveConfig.spacing, responsiveConfig.cardWidth, showScrollToTop]);

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - loadMoreThreshold;

      setShowScrollToTop(contentOffset.y > 200);

      if (isCloseToBottom && !loadingMore && onEndReached) {
        onEndReached();
      }
    },
    [onEndReached, loadingMore, loadMoreThreshold]
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    // 滚动动画结束后聚焦第一个卡片
    setTimeout(() => {
      firstCardRef.current?.focus?.();
    }, 500); // 500ms 适配大多数动画时长
  };

  const renderFooter = () => {
    if (ListFooterComponent) {
      if (React.isValidElement(ListFooterComponent)) {
        return ListFooterComponent;
      } else if (typeof ListFooterComponent === "function") {
        const Component = ListFooterComponent;
        return <Component />;
      }
      return null;
    }
    if (loadingMore) {
      return <ActivityIndicator style={{ marginVertical: 20 }} size="large" />;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={commonStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.center}>
        <ThemedText type="subtitle" style={{ padding: responsiveConfig.spacing }}>
          {error}
        </ThemedText>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={commonStyles.center}>
        <ThemedText>{emptyMessage}</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={dynamicStyles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={responsiveConfig.deviceType !== 'tv'}
      >
        {data.length > 0 ? (
          <>
            {rows.map((row, rowIndex) => {
              const isFullRow = row.length === effectiveColumns;
              const rowStyle = isFullRow ? dynamicStyles.fullRowContainer : dynamicStyles.partialRowContainer;

              return (
                <View key={rowIndex} style={[dynamicStyles.rowContainer, rowStyle]}>
                  {row.map((item, itemIndex) => {
                    const actualIndex = rowIndex * effectiveColumns + itemIndex;
                    const isLastItem = itemIndex === row.length - 1;

                    return (
                      <View 
                        key={actualIndex} 
                        style={isLastItem ? dynamicStyles.lastItemContainer : dynamicStyles.itemContainer}
                      >
                        {renderItem({ item, index: actualIndex })}
                      </View>
                    );
                  })}
                </View>
              );
            })}
            {renderFooter()}
          </>
        ) : (
          <View style={commonStyles.center}>
            <ThemedText>{emptyMessage}</ThemedText>
          </View>
        )}
      </ScrollView>
      {deviceType !== 'tv' && (
        <TouchableOpacity
          style={dynamicStyles.scrollToTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <ThemedText>⬆️</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomScrollView;
