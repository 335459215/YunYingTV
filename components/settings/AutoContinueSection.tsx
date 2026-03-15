import React from 'react';
import { View, StyleSheet, Switch, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSettingsStore } from '@/stores/settingsStore';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getCommonResponsiveStyles } from '@/utils/ResponsiveStyles';

interface AutoContinueSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
}

export const AutoContinueSection: React.FC<AutoContinueSectionProps> = ({ onChanged, onFocus }) => {
  const { autoContinuePlayback, setAutoContinuePlayback } = useSettingsStore();
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType } = responsiveConfig;

  const handleToggle = (value: boolean) => {
    setAutoContinuePlayback(value);
    onChanged();
  };

  return (
    <ThemedView 
      style={styles.container} 
    >
      <View style={styles.header}>
        <ThemedText style={commonStyles.sectionTitle}>自动续播</ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText style={commonStyles.textSmall}>
          开启后，应用启动时会自动从上次观看的位置继续播放
        </ThemedText>
        <View style={styles.switchContainer}>
          <Switch
            value={autoContinuePlayback}
            onValueChange={handleToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoContinuePlayback ? '#3b82f6' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={deviceType === 'tv' ? styles.tvSwitch : styles.switch}
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    marginLeft: 20,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scale: 0.8 }] : [],
  },
  tvSwitch: {
    transform: [{ scale: 1.2 }],
  },
});
