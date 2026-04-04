import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { DeviceUtils } from '@/utils/DeviceUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { InsetsLike } from '@/types/common';
import { Colors, Shadows, BorderRadius } from '@/constants/Colors';

interface ResponsiveHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
}) => {
  const router = useRouter();
  const { deviceType, spacing } = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  if (deviceType === 'tv') {
    return null;
  }

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const dynamicStyles = createStyles(spacing, deviceType, insets);

  return (
    <>
      <StatusBar backgroundColor={Colors.dark.surfaceElevated} barStyle="light-content" />
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={dynamicStyles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} color={Colors.dark.text} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          <View style={dynamicStyles.centerSection}>
            {title && (
              <ThemedText style={dynamicStyles.title} numberOfLines={1}>
                {title}
              </ThemedText>
            )}
          </View>

          <View style={dynamicStyles.rightSection}>
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
};

const createStyles = (spacing: number, deviceType: string, insets: InsetsLike) => {
  const minTouchTarget = DeviceUtils.getMinTouchTargetSize();

  return StyleSheet.create({
    container: {
      backgroundColor: Colors.dark.surfaceElevated,
      paddingTop: insets.top,
      borderBottomWidth: 0.5,
      borderBottomColor: Colors.dark.border,
      ...Shadows.dark.sm,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing,
      paddingVertical: spacing * 0.75,
      minHeight: minTouchTarget + spacing,
    },
    leftSection: {
      width: minTouchTarget + spacing,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    centerSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightSection: {
      width: minTouchTarget + spacing,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      flexDirection: 'row',
    },
    backButton: {
      width: minTouchTarget,
      height: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.full,
    },
    title: {
      fontSize: DeviceUtils.getOptimalFontSize(deviceType === 'mobile' ? 18 : 20),
      fontWeight: '700',
      color: Colors.dark.text,
    },
  });
};

export default React.memo(ResponsiveHeader);
