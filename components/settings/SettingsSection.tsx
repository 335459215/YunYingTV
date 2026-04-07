import React, { useState } from "react";
import { StyleSheet, Pressable, Platform, ViewStyle } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface SettingsSectionProps {
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  focusable?: boolean;
  style?: ViewStyle;
}

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({ children, onFocus, onBlur, onPress, focusable = false, style }) => {
  const [isFocused, setIsFocused] = useState(false);
  const deviceType = useResponsiveLayout().deviceType;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  if (!focusable) {
    return <ThemedView style={[styles.section, style]}>{children}</ThemedView>;
  }

  return (
    <ThemedView style={[styles.section, isFocused && styles.sectionFocused, style]}>
      <Pressable
        android_ripple={Platform.isTV || deviceType !== 'tv' ? { color: 'transparent' } : { color: Colors.dark.link }}
        style={styles.sectionPressable}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </ThemedView>
  );
});

SettingsSection.displayName = 'SettingsSection';

const styles = StyleSheet.create({
  section: {
    paddingVertical: 4,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    overflow: "hidden",
  },
  sectionFocused: {
    backgroundColor: "rgba(0, 201, 107, 0.06)",
  },
  sectionPressable: {
    width: "100%",
  },
});
