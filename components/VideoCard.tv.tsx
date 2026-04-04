import React, { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { View, Image, StyleSheet, Pressable, TouchableOpacity, Alert, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Star, Play } from "lucide-react-native";
import { PlayRecordManager } from "@/services/storage";
import { API } from "@/services/api";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
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

const VideoCard = forwardRef<View, VideoCardProps>(
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
);

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
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    borderWidth: 0,
    borderColor: Colors.dark.primary,
  },
  cardFocused: {
    borderColor: Colors.dark.primary,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 187, 94, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  ratingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
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
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourceNameBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 187, 94, 0.9)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.dark.primary,
  },
  progressBarFocused: {
    backgroundColor: "#00ff7f",
    shadowColor: "#00ff7f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  continueWatchingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 187, 94, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  continueWatchingText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  continueLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  continueLabelFocused: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  titleText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  titleTextFocused: {
    color: Colors.dark.primary,
    fontWeight: "700",
  },
});
