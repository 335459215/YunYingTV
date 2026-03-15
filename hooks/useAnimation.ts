import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

// 动画配置常量
export const ANIMATION_CONFIG = {
  // 弹簧动画配置
  spring: {
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  },
  // 快速弹簧
  springFast: {
    friction: 7,
    tension: 60,
    useNativeDriver: true,
  },
  // 柔和弹簧
  springSoft: {
    friction: 10,
    tension: 30,
    useNativeDriver: true,
  },
  // 时间动画配置
  timing: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  // 快速时间动画
  timingFast: {
    duration: 150,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },
  // 慢速时间动画
  timingSlow: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// 按钮聚焦动画
export const useButtonAnimation = (isFocused: boolean, scale: number = 1.05) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isFocused ? scale : 1,
        ...ANIMATION_CONFIG.spring,
      }),
      Animated.timing(opacityValue, {
        toValue: isFocused ? 1 : 0.8,
        ...ANIMATION_CONFIG.timing,
      }),
    ]).start();
  }, [isFocused, scaleValue, opacityValue, scale]);

  return {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };
};

// 卡片聚焦动画 - 增强版
export const useCardFocusAnimation = (isFocused: boolean) => {
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(2)).current;
  const borderWidth = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.08 : 1,
        ...ANIMATION_CONFIG.springFast,
      }),
      Animated.timing(elevation, {
        toValue: isFocused ? 20 : 2,
        ...ANIMATION_CONFIG.timing,
      }),
      Animated.timing(borderWidth, {
        toValue: isFocused ? 3 : 0,
        ...ANIMATION_CONFIG.timingFast,
      }),
      Animated.timing(shadowOpacity, {
        toValue: isFocused ? 0.6 : 0.1,
        ...ANIMATION_CONFIG.timing,
      }),
    ]).start();
  }, [isFocused, scale, elevation, borderWidth, shadowOpacity]);

  return {
    scale,
    elevation,
    borderWidth,
    shadowOpacity,
  };
};

// 淡入动画
export const useFadeIn = (delay: number = 0, duration: number = 400) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return {
    opacity,
    transform: [{ translateY }],
  };
};

// 交错淡入动画
export const useStaggeredFadeIn = (index: number, baseDelay: number = 50) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = index * baseDelay;
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale, index, baseDelay]);

  return {
    opacity,
    transform: [{ translateY }, { scale }],
  };
};

// 脉冲动画 - 用于吸引注意力
export const usePulseAnimation = (active: boolean = true) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [active, scale, opacity]);

  return {
    transform: [{ scale }],
    opacity,
  };
};

// 滑动动画
export const useSlideAnimation = (direction: 'left' | 'right' | 'up' | 'down' = 'up', distance: number = 50) => {
  const translateX = useRef(new Animated.Value(direction === 'left' ? distance : direction === 'right' ? -distance : 0)).current;
  const translateY = useRef(new Animated.Value(direction === 'up' ? distance : direction === 'down' ? -distance : 0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        ...ANIMATION_CONFIG.timingSlow,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        ...ANIMATION_CONFIG.timingSlow,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        ...ANIMATION_CONFIG.timingSlow,
      }),
    ]).start();
  }, [translateX, translateY, opacity]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
        ...ANIMATION_CONFIG.timing,
      }),
      Animated.timing(translateY, {
        toValue: direction === 'up' ? -distance : direction === 'down' ? distance : 0,
        ...ANIMATION_CONFIG.timing,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        ...ANIMATION_CONFIG.timing,
      }),
    ]).start();
  }, [translateX, translateY, opacity, direction, distance]);

  return {
    transform: [{ translateX }, { translateY }],
    opacity,
    animateIn,
    animateOut,
  };
};

// 呼吸效果 - 用于背景或强调
export const useBreathingAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    breathing.start();
    return () => breathing.stop();
  }, [scale]);

  return {
    transform: [{ scale }],
  };
};
