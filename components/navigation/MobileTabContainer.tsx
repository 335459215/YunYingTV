import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Heart, Settings, Tv } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useResponsiveLayout, useResponsiveStyles } from '@/hooks/useResponsiveLayout';
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

interface MobileTabContainerProps {
  children: React.ReactNode;
}

const MobileTabContainer: React.FC<MobileTabContainerProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { spacing, deviceType } = useResponsiveLayout();
  const responsiveStyles = useResponsiveStyles();
  
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

  const dynamicStyles = createStyles(spacing, responsiveStyles.minTouchTarget);

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
                    {
                      scale: tabAnimations[tab.key],
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[dynamicStyles.tab, isActive && dynamicStyles.activeTab]}
                onPress={() => handleTabPress(tab.route, tab.key)}
                activeOpacity={0.7}
                accessibilityLabel={tab.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <IconComponent
                  size={isActive ? 22 : 20}
                  color={isActive ? Colors.dark.primary : '#888'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text style={[
                  dynamicStyles.tabLabel,
                  isActive && dynamicStyles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (spacing: number, minTouchTarget: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: '#1c1c1e',
      borderTopWidth: 1,
      borderTopColor: '#333',
      paddingTop: spacing / 2,
      paddingBottom: Platform.OS === 'ios' ? spacing * 2 : spacing,
      paddingHorizontal: spacing,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 10,
    },
    tabWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: minTouchTarget,
      paddingVertical: spacing / 2,
      paddingHorizontal: spacing / 2,
      borderRadius: 12,
      width: '100%',
    },
    activeTab: {
      backgroundColor: 'rgba(64, 156, 255, 0.1)',
    },
    tabLabel: {
      fontSize: 11,
      color: '#888',
      marginTop: 4,
      fontWeight: '500',
    },
    activeTabLabel: {
      color: Colors.dark.primary,
      fontWeight: '600',
    },
  });
};

export default MobileTabContainer;
