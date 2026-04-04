import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Heart, Settings, Tv } from 'lucide-react-native';
import { Colors, BorderRadius } from '@/constants/Colors';
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

const MobileBottomTabNavigator = () => {
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
      <View style={dynamicStyles.tabRow}>
        {filteredTabs.map((tab) => {
          const isActive = isTabActive(tab.route);
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              style={dynamicStyles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={[dynamicStyles.iconCircle, isActive && dynamicStyles.activeIconCircle]}>
                <IconComponent
                  size={22}
                  color={isActive ? Colors.dark.primary : Colors.dark.textTertiary}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
              </View>
              <ThemedText style={[
                dynamicStyles.tabLabel,
                isActive && dynamicStyles.activeTabLabel,
              ]}>
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (spacing: number) => {
  const minTouchTarget = DeviceUtils.getMinTouchTargetSize();

  return StyleSheet.create({
    container: {
      paddingBottom: Platform.OS === 'ios' ? spacing * 2 : spacing + 8,
      paddingTop: spacing * 0.5,
      paddingHorizontal: spacing * 0.8,
      backgroundColor: 'transparent',
    },
    tabRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    tab: {
      flex: 0,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: minTouchTarget + 12,
      paddingVertical: spacing * 0.3,
      paddingHorizontal: spacing * 0.5,
      borderRadius: BorderRadius.lg,
    },
    iconCircle: {
      width: 44,
      height: 36,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    activeIconCircle: {
      backgroundColor: 'rgba(0, 201, 107, 0.10)',
    },
    tabLabel: {
      fontSize: 11,
      color: Colors.dark.textTertiary,
      fontWeight: '500',
      letterSpacing: 0.15,
    },
    activeTabLabel: {
      color: Colors.dark.primary,
      fontWeight: '700',
    },
  });
};

export default MobileBottomTabNavigator;
