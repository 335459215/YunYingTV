import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettingsStore } from '@/stores/settingsStore';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getCommonResponsiveStyles } from '@/utils/ResponsiveStyles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Moon, Sun, GlassWater } from 'lucide-react-native';

interface ThemeSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

type ThemeOption = {
  key: 'dark' | 'light' | 'glass';
  label: string;
  description: string;
  icon: typeof Moon;
};

const themeOptions: ThemeOption[] = [
  {
    key: 'dark',
    label: '深色模式',
    description: '护眼暗色，适合观影环境',
    icon: Moon,
  },
  {
    key: 'light',
    label: '浅色模式',
    description: '明亮清新，白天使用舒适',
    icon: Sun,
  },
  {
    key: 'glass',
    label: '透明模式',
    description: '半透明毛玻璃，现代感十足',
    icon: GlassWater,
  },
];

export const ThemeSection: React.FC<ThemeSectionProps> = React.memo(({ onChanged, onFocus }) => {
  const { theme, setTheme } = useSettingsStore();
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType } = responsiveConfig;
  const cardBg = useThemeColor({}, 'card');
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
        <ThemedText style={commonStyles.sectionTitle}>主题设置</ThemedText>
      </View>
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => {
          const isSelected = theme === option.key;
          const IconComponent = option.icon;
          return (
            <Pressable
              key={option.key}
              onPress={() => handleSelectTheme(option.key)}
              style={[
                styles.optionCard,
                isSelected && {
                  borderColor: primaryColor,
                  borderWidth: 2,
                  backgroundColor: deviceType === 'mobile' ? cardBg : undefined,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={deviceType === 'tv' ? 26 : 20}
                  color={isSelected ? primaryColor : '#8B919A'}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </View>
              <ThemedText
                style={[
                  styles.optionLabel,
                  isSelected && { color: primaryColor, fontWeight: '700' as const },
                ]}
              >
                {option.label}
              </ThemedText>
              <ThemedText style={[styles.optionDesc, commonStyles.textSmall]}>
                {option.description}
              </ThemedText>
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: primaryColor }]}>
                  <ThemedText style={styles.selectedText}>✓</ThemedText>
                </View>
              )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
    minHeight: 85,
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 2,
    textAlign: 'center',
  },
  optionDesc: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 13,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
