import {Text, type TextProps} from 'react-native';

import {useThemeColor} from '@/hooks/useThemeColor';
import {useTextStyles} from '@/hooks/useTextStyles';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 
          'body' | 'bodyBold' | 'bodySmall' | 'bodySmallBold' | 
          'caption' | 'captionBold' | 
          'button' | 'buttonSmall' | 'buttonLarge' | 
          'link' | 'linkSmall' | 
          'navItem' | 'navItemActive' | 
          'tab' | 'tabActive' |
          'subtitle' | 'subtitleBold';
};

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
