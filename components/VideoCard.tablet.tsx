import React, { useState, useCallback, useRef, forwardRef } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Star, Play } from "lucide-react-native";
import { PlayRecordManager } from "@/services/storage";
import { API } from "@/services/api";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import Logger from '@/utils/Logger';
import { useStaggeredFadeIn } from "@/hooks/useAnimation";

const logger = Logger.withTag('VideoCardTablet');

interface VideoCardTabletProps extends React.ComponentProps<typeof TouchableOpacity> {
  id: string;
  source: string;
  title: string;
  poster: string;
  year?: string;
  rate?: string;
  sourceName?: string;
  progress?: number;
  playTime?: number;
  episodeIndex?: number;
  totalEpisodes?: number;
  onFocus?: () => void;
  onRecordDeleted?: () => void;
  api: API;
  index?: number;
}

const VideoCardTablet = forwardRef<View, VideoCardTabletProps>(
  (
    {
      id,
      source,
      title,
      poster,
      year,
      rate,
      sourceName,
      progress,
      episodeIndex,
      onFocus,
      onRecordDeleted,
      api,
      playTime = 0,
      index = 0,
    }: VideoCardTabletProps,
    ref
  ) => {
    const router = useRouter();
    const { cardWidth, cardHeight, spacing } = useResponsiveLayout();
    
    // 使用新的动画系统
    const fadeInAnim = useStaggeredFadeIn(index, 50);
    const [isPressed, setIsPressed] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const longPressTriggered = useRef(false);

    const handlePress = () => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
      
      if (progress !== undefined && episodeIndex !== undefined) {
        router.push({
          pathname: "/play",
          params: { source, id, episodeIndex: episodeIndex - 1, title, position: playTime * 1000 },
        });
      } else {
        router.push({
          pathname: "/detail",
          params: { source, q: title },
        });
      }
    };

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handleLongPress = () => {
      if (progress === undefined) return;

      longPressTriggered.current = true;

      Alert.alert("删除观看记录", `确定要删除"${title}"的观看记录吗？`, [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              await PlayRecordManager.remove(source, id);
              onRecordDeleted?.();
            } catch (error) {
              logger.error("Failed to delete play record:", error);
              Alert.alert("错误", "删除观看记录失败，请重试");
            }
          },
        },
      ]);
    };

    const isContinueWatching = progress !== undefined && progress > 0 && progress < 1;

    const animatedStyle = {
      transform: [{ scale: scaleAnim }],
    };

    const styles = createTabletStyles(cardWidth, cardHeight, spacing);

    return (
      <Animated.View style={[styles.wrapper, fadeInAnim, animatedStyle]} ref={ref}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          style={styles.pressable}
          activeOpacity={0.9}
          delayLongPress={800}
        >
          <View style={[styles.card, isPressed && styles.cardPressed]}>
            <Image source={{ uri: api.getImageProxyUrl(poster) }} style={styles.poster} />
            
            {/* 渐变遮罩 */}
            <View style={styles.gradientOverlay} />
            
            {/* 按压效果遮罩 */}
            {isPressed && (
              <View style={styles.pressOverlay}>
                {isContinueWatching ? (
                  <View style={styles.continueWatchingBadge}>
                    <Play size={18} color="#ffffff" fill="#ffffff" />
                    <ThemedText style={styles.continueWatchingText}>继续观看</ThemedText>
                  </View>
                ) : (
                  <View style={styles.playButton}>
                    <Play size={32} color="#ffffff" fill="#ffffff" />
                  </View>
                )}
              </View>
            )}

            {/* 进度条 */}
            {isContinueWatching && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${(progress || 0) * 100}%` }]} />
              </View>
            )}

            {/* 继续观看标识 */}
            {isContinueWatching && !isPressed && (
              <View style={styles.continueWatchingIndicator}>
                <Play size={12} color="#ffffff" fill="#ffffff" />
                <ThemedText style={styles.continueWatchingIndicatorText}>继续</ThemedText>
              </View>
            )}

            {/* 评分 */}
            {rate && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <ThemedText style={styles.ratingText}>{rate}</ThemedText>
              </View>
            )}

            {/* 年份 */}
            {year && (
              <View style={styles.yearBadge}>
                <ThemedText style={styles.badgeText}>{year}</ThemedText>
              </View>
            )}

            {/* 来源 */}
            {sourceName && (
              <View style={styles.sourceNameBadge}>
                <ThemedText style={styles.badgeText}>{sourceName}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <ThemedText numberOfLines={2} style={styles.title}>{title}</ThemedText>
            {isContinueWatching && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.continueLabel} numberOfLines={1}>
                  第{episodeIndex! + 1}集 · {Math.round((progress || 0) * 100)}%
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

VideoCardTablet.displayName = "VideoCardTablet";

const createTabletStyles = (cardWidth: number, cardHeight: number, spacing: number) => {
  return StyleSheet.create({
    wrapper: {
      width: cardWidth,
      marginHorizontal: spacing / 2,
      marginBottom: spacing,
    },
    pressable: {
      alignItems: 'center',
    },
    card: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: 14,
      backgroundColor: "#1a1a1a",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    cardPressed: {
      shadowColor: Colors.dark.primary,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 10,
    },
    poster: {
      width: "100%",
      height: "100%",
      resizeMode: 'cover',
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.05)",
    },
    pressOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(0, 187, 94, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    progressContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 5,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      overflow: "hidden",
    },
    progressBar: {
      height: 5,
      backgroundColor: Colors.dark.primary,
    },
    continueWatchingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
    },
    continueWatchingText: {
      color: "white",
      marginLeft: 6,
      fontSize: 14,
      fontWeight: "bold",
    },
    continueWatchingIndicator: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    continueWatchingIndicatorText: {
      color: "white",
      marginLeft: 4,
      fontSize: 11,
      fontWeight: "bold",
    },
    ratingContainer: {
      position: "absolute",
      top: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    ratingText: {
      color: "#FFD700",
      fontSize: 12,
      fontWeight: "bold",
      marginLeft: 4,
    },
    yearBadge: {
      position: "absolute",
      bottom: 12,
      right: 10,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    sourceNameBadge: {
      position: "absolute",
      bottom: 12,
      left: 10,
      backgroundColor: "rgba(0, 187, 94, 0.9)",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: "white",
      fontSize: 11,
      fontWeight: "700",
    },
    infoContainer: {
      width: cardWidth,
      marginTop: 10,
      alignItems: "flex-start",
      paddingHorizontal: 4,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 4,
    },
    title: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    continueLabel: {
      color: Colors.dark.primary,
      fontSize: 13,
      fontWeight: "500",
    },
  });
};

export default VideoCardTablet;
