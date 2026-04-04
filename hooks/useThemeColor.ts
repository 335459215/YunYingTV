/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import {Colors} from '@/constants/Colors';

type ColorName = keyof typeof Colors.dark;

const variantToColorMap: Record<string, ColorName> = {
  background: 'background',
  surface: 'surface',
  surfaceElevated: 'surfaceElevated',
  card: 'card',
  cardElevated: 'cardElevated',
  text: 'text',
  border: 'border',
};

export function useThemeColor(
  props: {light?: string; dark?: string},
  colorName: string,
) {
  const theme = 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const mappedColor = variantToColorMap[colorName] as ColorName;
  if (mappedColor && Colors.dark[mappedColor]) {
    return Colors.dark[mappedColor];
  }

  return Colors.dark[colorName as ColorName] ?? Colors.dark.text;
}

export function useThemeColorWithVariant(
  props: {light?: string; dark?: string},
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  variant?: 'light' | 'dark'
) {
  const theme = variant || 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
