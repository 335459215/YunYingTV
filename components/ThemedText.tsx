import {Text, type TextProps} from 'react-native';

import {useThemeColor} from '@/hooks/useThemeColor';
import {useTextStyles} from '@/hooks/useTextStyles';

/**
 * ThemedText 组件属性
 * @interface ThemedTextProps
 * @extends {TextProps}
 */
export type ThemedTextProps = TextProps & {
  /** 浅色模式文本颜色 */
  lightColor?: string;
  /** 深色模式文本颜色 */
  darkColor?: string;
  /** 预设文本类型 */
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |
          'body' | 'bodyBold' | 'bodySmall' | 'bodySmallBold' |
          'caption' | 'captionBold' |
          'button' | 'buttonSmall' | 'buttonLarge' |
          'link' | 'linkSmall' |
          'navItem' | 'navItemActive' |
          'tab' | 'tabActive' |
          'subtitle' | 'subtitleBold';
};

/**
 * 支持主题的文本组件
 * 根据当前主题自动选择浅色或深色模式颜色
 * @param {ThemedTextProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的文本组件
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({light: lightColor, dark: darkColor}, 'text');
  const styles = useTextStyles();

  return (
    <Text
      style={[
        {color},
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}
