import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettingsStore } from '@/stores/settingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Moon, Sun, GlassWater } from 'lucide-react-native';

interface ThemeSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

type ThemeOption = {
  key: 'dark' | 'light' | 'glass';
  label: string;
  icon: typeof Moon;
};

const themeOptions: ThemeOption[] = [
  { key: 'dark', label: '深色', icon: Moon },
  { key: 'light', label: '浅色', icon: Sun },
  { key: 'glass', label: '透明', icon: GlassWater },
];

export const ThemeSection: React.FC<ThemeSectionProps> = React.memo(({ onChanged, onFocus }) => {
  const { theme, setTheme } = useSettingsStore();
  const primaryColor = useThemeColor({}, 'primary');

  const handleSelectTheme = (selectedTheme: 'dark' | 'light' | 'glass') => {
    if (selectedTheme !== theme) {
      setTheme(selectedTheme);
      onChanged();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionLabel}>外观</ThemedText>
      </View>

      <View style={styles.segmentContainer}>
        {themeOptions.map((option) => {
          const isSelected = theme === option.key;
          const IconComponent = option.icon;

          return (
            <Pressable
              key={option.key}
              onPress={() => handleSelectTheme(option.key)}
              style={[
                styles.segment,
                isSelected && { backgroundColor: primaryColor },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <IconComponent
                size={15}
                color={isSelected ? '#FFFFFF' : '#8B919A'}
                strokeWidth={isSelected ? 2.2 : 1.8}
              />
              <ThemedText
                style={[
                  styles.segmentLabel,
                  !isSelected && styles.segmentLabelInactive,
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
});

ThemeSection.displayName = 'ThemeSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B919A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  segmentLabelInactive: {
    color: "#8B919A",
    fontWeight: "500",
  },
});
