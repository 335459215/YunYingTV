import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Settings, Tv } from 'lucide-react-native';
import { BorderRadius } from '@/constants/Colors';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { IconComponentType } from '@/types/common';
import { ThemedText } from '@/components/ThemedText';

interface TabItem {
  key: string;
  label: string;
  icon: IconComponentType;
  route: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: '首页', icon: Home, route: '/' },
  { key: 'live', label: '直播', icon: Tv, route: '/live' },
  { key: 'settings', label: '设置', icon: Settings, route: '/settings' },
];

interface MobileTabContainerProps {
  children: React.ReactNode;
}

const MobileTabContainer = ({ children }: MobileTabContainerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { spacing, deviceType } = useResponsiveLayout();
  const primaryColor = useThemeColor({}, 'primary');
  const textTertiary = useThemeColor({}, 'textTertiary');

  const filteredTabs = tabs.filter(tab =>
    deviceType !== 'mobile' || tab.key !== 'live'
  );

  const [tabAnimations] = useState(() => {
    return filteredTabs.reduce((acc, tab) => {
      acc[tab.key] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>);
  });

  const handleTabPress = (route: string, tabKey: string) => {
    Animated.sequence([
      Animated.timing(tabAnimations[tabKey], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tabAnimations[tabKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(route as never);
  };

  const isTabActive = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname === route) return true;
    return false;
  };

  const dynamicStyles = createStyles(spacing, primaryColor, textTertiary);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        {children}
      </View>

      <View style={dynamicStyles.tabBar}>
        {filteredTabs.map((tab) => {
          const isActive = isTabActive(tab.route);
          const IconComponent = tab.icon;

          return (
            <Animated.View
              key={tab.key}
              style={[
                dynamicStyles.tabWrapper,
                {
                  transform: [
                    { scale: tabAnimations[tab.key] },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[dynamicStyles.tab, isActive && dynamicStyles.activeTab]}
                onPress={() => handleTabPress(tab.route, tab.key)}
                activeOpacity={0.7}
              >
                <View style={[dynamicStyles.iconCircle, isActive && dynamicStyles.activeIconCircle]}>
                  <IconComponent
                    size={22}
                    color={isActive ? primaryColor : textTertiary}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                </View>
                <ThemedText style={[
                  dynamicStyles.tabLabel,
                  isActive && dynamicStyles.activeTabLabel
                ]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (spacing: number, primaryColor: string, textTertiary: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingTop: spacing * 0.4,
    paddingBottom: Platform.OS === 'ios' ? spacing * 2 : spacing + 8,
    paddingHorizontal: spacing * 1.2,
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing * 0.25,
    paddingHorizontal: spacing * 0.4,
    borderRadius: BorderRadius.lg,
  },
  activeTab: {},
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
    color: textTertiary,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  activeTabLabel: {
    color: primaryColor,
    fontWeight: '700',
  },
});

export default MobileTabContainer;
