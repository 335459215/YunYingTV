import {Colors} from '@/constants/Colors';
import {useSettingsStore} from '@/stores/settingsStore';

type CommonColorName = keyof typeof Colors.light & keyof typeof Colors.dark & keyof typeof Colors.glass;
type ThemeMode = 'light' | 'dark' | 'glass';

const variantToColorMap: Record<string, CommonColorName> = {
  background: 'background',
  surface: 'surface',
  surfaceElevated: 'surfaceElevated',
  card: 'card',
  cardElevated: 'cardElevated',
  text: 'text',
  border: 'border',
};

export function useThemeColor(
  props: {light?: string; dark?: string; glass?: string},
  colorName: string,
) {
  const theme = useSettingsStore((state) => state.theme) as ThemeMode;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const mappedColor = variantToColorMap[colorName] as CommonColorName;
  if (mappedColor && Colors[theme]?.[mappedColor]) {
    return (Colors[theme] as Record<string, string>)[mappedColor];
  }

  return (Colors[theme] as Record<string, string>)[colorName] ?? Colors.dark.text;
}

export function useThemeColorWithVariant(
  props: {light?: string; dark?: string; glass?: string},
  colorName: CommonColorName,
  variant?: ThemeMode
) {
  const currentTheme = useSettingsStore((state) => state.theme) as ThemeMode;
  const theme = variant || currentTheme;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName] ?? Colors.dark.text;
  }
}

export function useCurrentTheme() {
  return useSettingsStore((state) => state.theme) as ThemeMode;
}
