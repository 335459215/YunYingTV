import React, { useState, useRef, forwardRef, useMemo } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Star, Play } from "lucide-react-native";
import { PlayRecordManager } from "@/services/storage";
import { API } from "@/services/api";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Shadows, BorderRadius } from "@/constants/Colors";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import Logger from '@/utils/Logger';
import { useStaggeredFadeIn } from "@/hooks/useAnimation";

const logger = Logger.withTag('VideoCardMobile');

interface VideoCardMobileProps extends React.ComponentProps<typeof TouchableOpacity> {
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

const VideoCardMobile = React.memo(forwardRef<View, VideoCardMobileProps>(
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
    }: VideoCardMobileProps,
    ref
  ) => {
    const router = useRouter();
    const { cardWidth, cardHeight, spacing } = useResponsiveLayout();
    
    // 使用新的动画系统
    const fadeInAnim = useStaggeredFadeIn(index, 40);
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

    const handlePressIn = () => {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

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

    const styles = useMemo(() => createMobileStyles(cardWidth, cardHeight, spacing), [cardWidth, cardHeight, spacing]);

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
                    <Play size={14} color="#ffffff" fill="#ffffff" />
                    <ThemedText style={styles.continueWatchingText}>继续</ThemedText>
                  </View>
                ) : (
                  <View style={styles.playButton}>
                    <Play size={24} color="#ffffff" fill="#ffffff" />
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
                <Play size={10} color="#ffffff" fill="#ffffff" />
                <ThemedText style={styles.continueWatchingIndicatorText}>继续</ThemedText>
              </View>
            )}

            {/* 评分 */}
            {rate && (
              <View style={styles.ratingContainer}>
                <Star size={10} color="#FFD700" fill="#FFD700" />
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
              <ThemedText style={styles.continueLabel} numberOfLines={1}>
                第{episodeIndex! + 1}集 · {Math.round((progress || 0) * 100)}%
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
));

VideoCardMobile.displayName = "VideoCardMobile";

const createMobileStyles = (cardWidth: number, cardHeight: number, spacing: number) => {
  return StyleSheet.create({
    wrapper: {
      width: cardWidth,
      marginBottom: spacing * 0.8,
    },
    pressable: {
      alignItems: 'flex-start',
    },
    card: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: BorderRadius.md,
      backgroundColor: Colors.dark.card,
      overflow: "hidden",
      ...Shadows.dark.sm,
    },
    cardPressed: {
      ...Shadows.dark.md,
      shadowColor: Colors.dark.primary,
      elevation: 8,
    },
    poster: {
      width: "100%",
      height: "100%",
      resizeMode: 'cover',
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    pressOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: BorderRadius.md,
    },
    playButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.dark.primary,
      justifyContent: "center",
      alignItems: "center",
      ...Shadows.dark.sm,
      elevation: 6,
    },
    progressContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: "rgba(10, 11, 13, 0.7)",
      borderBottomLeftRadius: BorderRadius.md,
      borderBottomRightRadius: BorderRadius.md,
      overflow: "hidden",
    },
    progressBar: {
      height: 4,
      backgroundColor: Colors.dark.primary,
    },
    continueWatchingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: BorderRadius.sm,
    },
    continueWatchingText: {
      color: "#ffffff",
      marginLeft: 4,
      fontSize: 12,
      fontWeight: "700",
    },
    continueWatchingIndicator: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    continueWatchingIndicatorText: {
      color: "#ffffff",
      marginLeft: 3,
      fontSize: 10,
      fontWeight: "700",
    },
    ratingContainer: {
      position: "absolute",
      top: 8,
      right: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(10, 11, 13, 0.88)",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    ratingText: {
      color: "#FFD700",
      fontSize: 11,
      fontWeight: "700",
      marginLeft: 3,
    },
    yearBadge: {
      position: "absolute",
      bottom: 10,
      right: 8,
      backgroundColor: "rgba(10, 11, 13, 0.88)",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    sourceNameBadge: {
      position: "absolute",
      bottom: 10,
      left: 8,
      backgroundColor: Colors.dark.primary,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    badgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
    },
    infoContainer: {
      width: cardWidth,
      marginTop: 10,
      paddingHorizontal: 2,
    },
    title: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    continueLabel: {
      color: Colors.dark.primary,
      fontSize: 12,
      marginTop: 3,
      fontWeight: "500",
    },
  });
};

export default VideoCardMobile;
