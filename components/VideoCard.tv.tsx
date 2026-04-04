import React, { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { View, Image, StyleSheet, Pressable, TouchableOpacity, Alert, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Star, Play } from "lucide-react-native";
import { PlayRecordManager } from "@/services/storage";
import { API } from "@/services/api";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Shadows, BorderRadius } from "@/constants/Colors";
import Logger from '@/utils/Logger';
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useCardFocusAnimation, useStaggeredFadeIn } from "@/hooks/useAnimation";

const logger = Logger.withTag('VideoCardTV');

interface VideoCardProps extends React.ComponentProps<typeof TouchableOpacity> {
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
  hasTVPreferredFocus?: boolean;
  index?: number;
}

const VideoCard = React.memo(forwardRef<View, VideoCardProps>(
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
      hasTVPreferredFocus = false,
      index = 0,
    }: VideoCardProps,
    ref
  ) => {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    
    const longPressTriggered = useRef(false);
    
    const { deviceType, cardWidth, cardHeight } = useResponsiveLayout();
    
    // 使用新的动画系统
    const fadeInAnim = useStaggeredFadeIn(index, 60);
    const focusAnim = useCardFocusAnimation(isFocused);

    useEffect(() => {
      if (hasTVPreferredFocus) {
        setIsFocused(true);
      }
    }, [hasTVPreferredFocus]);

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

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

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

              if (onRecordDeleted) {
                onRecordDeleted();
              }
              else if (router.canGoBack()) {
                router.replace("/");
              }
            } catch (error) {
              logger.error("Failed to delete play record:", error);
              Alert.alert("错误", "删除观看记录失败，请重试");
            }
          },
        },
      ]);
    };

    const isContinueWatching = progress !== undefined && progress > 0 && progress < 1;

    // 动画样式
    const animatedCardStyle = {
      transform: [{ scale: focusAnim.scale }],
      elevation: focusAnim.elevation,
      shadowOpacity: focusAnim.shadowOpacity,
    };

    const animatedBorderStyle = {
      borderWidth: focusAnim.borderWidth,
    };

    return (
      <Animated.View style={[styles.wrapper, fadeInAnim]}>
        <Pressable
          android_ripple={Platform.isTV || deviceType !== 'tv' ? { color: 'transparent' } : { color: Colors.dark.link }}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={({ pressed }) => [
            styles.pressable,
            {
              width: cardWidth + 24,
              height: cardHeight + 70,
              zIndex: pressed || isFocused ? 999 : 1,
            },
          ]}
          delayLongPress={800}
        >
          <Animated.View 
            style={[
              styles.card, 
              { width: cardWidth, height: cardHeight },
              animatedCardStyle,
              isFocused && animatedBorderStyle,
              isFocused && styles.cardFocused,
            ]}
          >
            <Image 
              source={{ uri: api.getImageProxyUrl(poster) }} 
              style={styles.poster}
              resizeMode="cover"
            />
            
            {/* 渐变遮罩 */}
            <View style={styles.gradientOverlay} />
            
            {/* 焦点状态下的播放按钮 */}
            {isFocused && (
              <Animated.View style={styles.focusOverlay}>
                {isContinueWatching ? (
                  <View style={styles.continueWatchingBadge}>
                    <Play size={20} color="#ffffff" fill="#ffffff" />
                    <ThemedText style={styles.continueWatchingText}>继续观看</ThemedText>
                  </View>
                ) : (
                  <View style={styles.playButton}>
                    <Play size={32} color="#ffffff" fill="#ffffff" />
                  </View>
                )}
              </Animated.View>
            )}

            {/* 观看进度条 */}
            {isContinueWatching && (
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar, 
                    { width: `${(progress || 0) * 100}%` },
                    isFocused && styles.progressBarFocused
                  ]} 
                />
              </View>
            )}

            {/* 评分徽章 */}
            {rate && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <ThemedText style={styles.ratingText}>{rate}</ThemedText>
              </View>
            )}
            
            {/* 年份徽章 */}
            {year && (
              <View style={styles.yearBadge}>
                <ThemedText style={styles.badgeText}>{year}</ThemedText>
              </View>
            )}
            
            {/* 源名称徽章 */}
            {sourceName && (
              <View style={styles.sourceNameBadge}>
                <ThemedText style={styles.badgeText}>{sourceName}</ThemedText>
              </View>
            )}
          </Animated.View>
          
          {/* 标题区域 */}
          <View style={[styles.infoContainer, { width: cardWidth }]}>
            <ThemedText 
              numberOfLines={1} 
              style={[styles.titleText, isFocused && styles.titleTextFocused]}
            >
              {title}
            </ThemedText>
            {isContinueWatching && (
              <View style={styles.infoRow}>
                <ThemedText style={[styles.continueLabel, isFocused && styles.continueLabelFocused]}>
                  第{episodeIndex}集 · {Math.round((progress || 0) * 100)}%
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }
));

VideoCard.displayName = "VideoCard";

export default VideoCard;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
  },
  pressable: {
    justifyContent: 'center',
    alignItems: "center",
    overflow: "visible",
  },
  card: {
    marginTop: 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.card,
    overflow: "hidden",
    ...Shadows.dark.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardFocused: {
    borderColor: Colors.dark.borderFocus,
    ...Shadows.dark.focus,
    borderWidth: 1.5,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.dark.lg,
    elevation: 12,
  },
  ratingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 11, 13, 0.88)",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Shadows.dark.sm,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
  infoContainer: {
    marginTop: 12,
    alignItems: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  yearBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(10, 11, 13, 0.88)",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourceNameBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "rgba(10, 11, 13, 0.7)",
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.dark.primary,
  },
  progressBarFocused: {
    backgroundColor: "#00E077",
    shadowColor: "#00E077",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  continueWatchingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    ...Shadows.dark.md,
    elevation: 12,
  },
  continueWatchingText: {
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  continueLabel: {
    color: Colors.dark.textTertiary,
    fontSize: 13,
    fontWeight: "500",
  },
  continueLabelFocused: {
    color: Colors.dark.textSecondary,
    fontWeight: "600",
  },
  titleText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  titleTextFocused: {
    color: Colors.dark.text,
    fontWeight: "700",
  },
});
