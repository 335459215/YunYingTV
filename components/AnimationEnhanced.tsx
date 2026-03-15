/**
 * 动画增强组件
 * 提供流畅的过渡动画效果
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

/**
 * 淡入动画组件
 */
export function FadeIn({ children, delay = 0, duration = 300, style }: FadeInProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, delay, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * 滑动进入动画组件
 */
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  style?: any;
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 400,
  style,
}: SlideInProps) {
  const slideAnim = useRef(new Animated.ValueXY({
    x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
  })).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: { x: 0, y: 0 },
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          transform: slideAnim.getTranslateTransform(),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * 缩放动画组件
 */
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function ScaleIn({ children, delay = 0, duration = 300, style }: ScaleInProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * 骨架屏加载组件
 */
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  animated?: boolean;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  animated = true,
  style,
}: SkeletonProps) {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shineAnim, animated]);

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.skeletonShine,
            {
              transform: [
                {
                  translateX: shineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, 200],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

/**
 * 列表项动画组件
 */
interface ListItemAnimationProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  style?: any;
}

export function ListItemAnimation({
  children,
  index,
  delay = 50,
  style,
}: ListItemAnimationProps) {
  return (
    <SlideIn
      direction="up"
      duration={300}
      delay={index * delay}
      style={style}
    >
      {children}
    </SlideIn>
  );
}

/**
 * 页面切换动画组件
 */
interface PageTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  onTransitionEnd?: () => void;
}

export function PageTransition({
  children,
  visible,
  onTransitionEnd,
}: PageTransitionProps) {
  const [mounted, setMounted] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 50)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => onTransitionEnd?.());
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
        onTransitionEnd?.();
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.pageTransition,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
  skeletonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pageTransition: {
    flex: 1,
  },
});
