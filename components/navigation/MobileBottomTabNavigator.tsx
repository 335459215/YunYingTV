import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Heart, Settings, Tv } from 'lucide-react-native';
import { Colors, Shadows, BorderRadius } from '@/constants/Colors';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { DeviceUtils } from '@/utils/DeviceUtils';
import { ThemedText } from '@/components/ThemedText';
import type { IconComponentType } from '@/types/common';

interface TabItem {
  key: string;
  label: string;
  icon: IconComponentType;
  route: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: '首页', icon: Home, route: '/' },
  { key: 'search', label: '搜索', icon: Search, route: '/search' },
  { key: 'live', label: '直播', icon: Tv, route: '/live' },
  { key: 'favorites', label: '收藏', icon: Heart, route: '/favorites' },
  { key: 'settings', label: '设置', icon: Settings, route: '/settings' },
];

const MobileBottomTabNavigator: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { spacing, deviceType } = useResponsiveLayout();

  const filteredTabs = tabs.filter(tab =>
    deviceType !== 'mobile' || tab.key !== 'live'
  );

  const handleTabPress = (route: string) => {
    router.push(route as never);
  };

  const isTabActive = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname === route) return true;
    return false;
  };

  const dynamicStyles = createStyles(spacing);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.indicatorBar} />
      {filteredTabs.map((tab) => {
        const isActive = isTabActive(tab.route);
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[dynamicStyles.tab, isActive && dynamicStyles.activeTab]}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <View style={[dynamicStyles.iconWrapper, isActive && dynamicStyles.activeIconWrapper]}>
              <IconComponent
                size={20}
                color={isActive ? Colors.dark.primary : Colors.dark.textTertiary}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {isActive && <View style={dynamicStyles.activeDot} />}
            </View>
            <ThemedText style={[
              dynamicStyles.tabLabel,
              isActive && dynamicStyles.activeTabLabel
            ]}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (spacing: number) => {
  const minTouchTarget = DeviceUtils.getMinTouchTargetSize();

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: Colors.dark.surfaceElevated,
      borderTopWidth: 0.5,
      borderTopColor: Colors.dark.border,
      paddingTop: spacing * 0.4,
      paddingBottom: Platform.OS === 'ios' ? spacing * 2 : spacing + 4,
      paddingHorizontal: spacing * 0.6,
      ...Shadows.dark.lg,
      shadowOffset: { width: 0, height: -3 },
    },
    indicatorBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: Platform.select({ ios: 34, android: 24 }),
      backgroundColor: Colors.dark.surfaceElevated,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: minTouchTarget,
      paddingVertical: spacing * 0.35,
      borderRadius: BorderRadius.md,
      position: 'relative',
    },
    activeTab: {
      backgroundColor: Colors.dark.focusGlow,
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
    },
    activeIconWrapper: {},
    activeDot: {
      position: 'absolute',
      bottom: -2,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.dark.primary,
    },
    tabLabel: {
      fontSize: 10,
      color: Colors.dark.textTertiary,
      marginTop: 2,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    activeTabLabel: {
      color: Colors.dark.primary,
      fontWeight: '700',
      fontSize: 10.5,
    },
  });
};

export default MobileBottomTabNavigator;
