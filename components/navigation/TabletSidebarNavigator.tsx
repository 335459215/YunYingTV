import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Heart, Settings, Tv, Menu, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useResponsiveLayout, useResponsiveStyles } from '@/hooks/useResponsiveLayout';
import { ThemedText } from '@/components/ThemedText';
import type { IconComponentType } from '@/types/common';

interface SidebarItem {
  key: string;
  label: string;
  icon: IconComponentType;
  route: string;
  section?: string;
}

const sidebarItems: SidebarItem[] = [
  { key: 'home', label: '首页', icon: Home, route: '/', section: 'main' },
  { key: 'search', label: '搜索', icon: Search, route: '/search', section: 'main' },
  { key: 'live', label: '直播', icon: Tv, route: '/live', section: 'main' },
  { key: 'favorites', label: '收藏', icon: Heart, route: '/favorites', section: 'user' },
  { key: 'settings', label: '设置', icon: Settings, route: '/settings', section: 'user' },
];

interface TabletSidebarNavigatorProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const TabletSidebarNavigator: React.FC<TabletSidebarNavigatorProps> = ({
  children,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { spacing, isPortrait } = useResponsiveLayout();
  const responsiveStyles = useResponsiveStyles();
  
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    return isPortrait;
  });
  
  const [sidebarAnimation] = useState(new Animated.Value(isPortrait ? 60 : 200));
  
  useEffect(() => {
    if (!controlledCollapsed) {
      const newCollapsedState = isPortrait;
      if (newCollapsedState !== internalCollapsed) {
        setInternalCollapsed(newCollapsedState);
        
        Animated.timing(sidebarAnimation, {
          toValue: newCollapsedState ? 60 : 200,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [isPortrait, controlledCollapsed, internalCollapsed, sidebarAnimation]);
  
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  const handleToggleCollapse = useCallback(() => {
    const newCollapsedState = !collapsed;
    
    Animated.timing(sidebarAnimation, {
      toValue: newCollapsedState ? 60 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    } else {
      setInternalCollapsed(newCollapsedState);
    }
  }, [collapsed, onToggleCollapse, sidebarAnimation]);

  const handleItemPress = (route: string) => {
    router.push(route as never);
    
    if (isPortrait && !controlledCollapsed) {
      handleToggleCollapse();
    }
  };

  const isItemActive = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname === route) return true;
    return false;
  };

  const sidebarWidth = collapsed ? 60 : 200;
  const dynamicStyles = createStyles(spacing, sidebarWidth, isPortrait, responsiveStyles.minTouchTarget);

  const renderSidebarItems = () => {
    const sections = ['main', 'user'];
    
    return sections.map((section) => {
      const sectionItems = sidebarItems.filter(item => item.section === section);
      
      return (
        <View key={section} style={dynamicStyles.section}>
          {!collapsed && (
            <ThemedText style={dynamicStyles.sectionTitle}>
              {section === 'main' ? '主要功能' : '用户'}
            </ThemedText>
          )}
          {sectionItems.map((item) => {
            const isActive = isItemActive(item.route);
            const IconComponent = item.icon;
            
            return (
              <TouchableOpacity
                key={item.key}
                style={[dynamicStyles.sidebarItem, isActive && dynamicStyles.activeSidebarItem]}
                onPress={() => handleItemPress(item.route)}
                activeOpacity={0.7}
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <IconComponent
                  size={isActive ? 22 : 20}
                  color={isActive ? Colors.dark.primary : '#ccc'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!collapsed && (
                  <Text style={[
                    dynamicStyles.sidebarItemLabel,
                    isActive && dynamicStyles.activeSidebarItemLabel
                  ]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  };

  return (
    <View style={dynamicStyles.container}>
      <Animated.View 
        style={[
          dynamicStyles.sidebar, 
          collapsed && dynamicStyles.collapsedSidebar,
          {
            width: sidebarAnimation,
          }
        ]}
      >
        <View style={dynamicStyles.sidebarHeader}>
          <TouchableOpacity
            onPress={handleToggleCollapse}
            style={dynamicStyles.toggleButton}
            activeOpacity={0.7}
            accessibilityLabel={collapsed ? '展开侧边栏' : '折叠侧边栏'}
            accessibilityRole="button"
          >
            {collapsed ? (
              <Menu size={20} color="#ccc" />
            ) : (
              <X size={20} color="#ccc" />
            )}
          </TouchableOpacity>
          {!collapsed && (
            <ThemedText style={dynamicStyles.appTitle}>YunYingTV</ThemedText>
          )}
        </View>

        <ScrollView 
          style={dynamicStyles.sidebarContent} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.sidebarContentContainer}
        >
          {renderSidebarItems()}
        </ScrollView>
      </Animated.View>

      <View style={dynamicStyles.content}>
        {children}
      </View>
    </View>
  );
};

const createStyles = (spacing: number, sidebarWidth: number, isPortrait: boolean, minTouchTarget: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: sidebarWidth,
      backgroundColor: '#1c1c1e',
      borderRightWidth: 1,
      borderRightColor: '#333',
      zIndex: isPortrait ? 1000 : 1,
    },
    collapsedSidebar: {
      width: 60,
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing,
      paddingVertical: spacing * 1.5,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    toggleButton: {
      width: minTouchTarget,
      height: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    appTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: spacing,
      color: Colors.dark.primary,
    },
    sidebarContent: {
      flex: 1,
    },
    sidebarContentContainer: {
      paddingTop: spacing,
      paddingBottom: spacing * 2,
    },
    section: {
      marginBottom: spacing * 2,
    },
    sectionTitle: {
      fontSize: 12,
      color: '#888',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: spacing / 2,
      marginHorizontal: spacing,
      letterSpacing: 0.5,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing,
      paddingVertical: spacing * 0.75,
      marginHorizontal: spacing / 2,
      borderRadius: 10,
      minHeight: minTouchTarget,
      marginVertical: 2,
    },
    activeSidebarItem: {
      backgroundColor: 'rgba(64, 156, 255, 0.15)',
    },
    sidebarItemLabel: {
      fontSize: 14,
      color: '#ccc',
      marginLeft: spacing,
      fontWeight: '500',
    },
    activeSidebarItemLabel: {
      color: Colors.dark.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      backgroundColor: '#000',
    },
  });
};

export default TabletSidebarNavigator;
