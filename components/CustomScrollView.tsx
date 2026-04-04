import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, BackHandler, NativeSyntheticEvent, NativeScrollEvent, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";
import { Colors, Shadows, BorderRadius } from "@/constants/Colors";

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
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
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
  refreshing = false,
  onRefresh,
}: CustomScrollViewProps<T>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const firstCardRef = useRef<{ focus?: () => void } | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType } = responsiveConfig;

  useEffect(() => {
    if (deviceType === 'tv') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showScrollToTop) {
          scrollToTop();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [deviceType, showScrollToTop]);

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
      backgroundColor: Colors.dark.surfaceElevated,
      padding: responsiveConfig.spacing,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: Colors.dark.borderStrong,
      ...Shadows.dark.md,
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
    setTimeout(() => {
      firstCardRef.current?.focus?.();
    }, 500);
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
      return (
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      );
    }
    return null;
  };

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.center}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.center, { paddingHorizontal: responsiveConfig.spacing * 2 }]}>
        <ThemedText type="subtitle" style={{ color: Colors.dark.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              marginTop: responsiveConfig.spacing,
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: BorderRadius.md,
              backgroundColor: Colors.dark.primary,
            }}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>重新加载</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <View style={[commonStyles.center, { paddingHorizontal: responsiveConfig.spacing * 3 }]}>
        <View style={{ marginBottom: 16, opacity: 0.4 }}>
          <ThemedText style={{ fontSize: 48 }}>📭</ThemedText>
        </View>
        <ThemedText style={{ color: Colors.dark.textSecondary, textAlign: 'center', fontSize: 15 }}>
          {emptyMessage}
        </ThemedText>
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
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
              colors={[Colors.dark.primary]}
              progressBackgroundColor={Colors.dark.background}
            />
          ) : undefined
        }
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
          <ThemedText style={{ fontSize: 16 }}>↑</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

CustomScrollView.displayName = 'CustomScrollView';

export default CustomScrollView;
