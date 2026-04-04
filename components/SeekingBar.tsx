import React from "react";
import { View, StyleSheet } from "react-native";
import usePlayerStore from "@/stores/playerStore";
import { formatTime } from "@/utils/timeUtils";
import { ThemedText } from "@/components/ThemedText";

/**
 * 播放器进度条组件
 * 当用户进行进度搜索时显示当前播放位置
 * @returns {React.ReactElement | null} 进度条组件或null
 */
export const SeekingBar = () => {
  const { isSeeking, seekPosition, status } = usePlayerStore();

  if (!isSeeking || !status?.isLoaded) {
    return null;
  }

  const durationMillis = status.durationMillis || 0;
  const currentPositionMillis = seekPosition * durationMillis;

  return (
    <View style={styles.seekingContainer}>
      <ThemedText style={styles.timeText}>
        {formatTime(currentPositionMillis)} / {formatTime(durationMillis)}
      </ThemedText>
      <View style={styles.seekingBarContainer}>
        <View style={styles.seekingBarBackground} />
        <View
          style={[
            styles.seekingBarFilled,
            {
              width: `${seekPosition * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seekingContainer: {
    position: "absolute",
    bottom: 80,
    left: "5%",
    right: "5%",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  seekingBarContainer: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2.5,
  },
  seekingBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2.5,
  },
  seekingBarFilled: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2.5,
  },
});
