import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { ThemedText } from "../ThemedText";
import { useUpdateStore } from "@/stores/updateStore";

export const UpdateSection = React.memo(function UpdateSection() {
  const { currentVersion } = useUpdateStore();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.row}>
        <ThemedText style={styles.label}>版本</ThemedText>
        <ThemedText style={styles.value}>v{currentVersion}</ThemedText>
      </View>
    </View>
  );
});

UpdateSection.displayName = 'UpdateSection';

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Platform.select({
      ios: "rgba(255, 255, 255, 0.05)",
      android: "rgba(255, 255, 255, 0.05)",
      default: "transparent",
    }),
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: Platform.isTV ? 18 : 16,
    color: "#999",
  },
  value: {
    fontSize: Platform.isTV ? 18 : 16,
  },
});
