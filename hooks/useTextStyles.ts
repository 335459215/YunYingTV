import {getTextStyles} from '@/constants/TextStyles';
import {useThemeColor} from './useThemeColor';
import {useScale} from './useScale';
import {useResponsiveLayout} from './useResponsiveLayout';

export function useTextStyles() {
  const linkColor = useThemeColor({}, 'link');
  const scale = useScale() ?? 1.0;
  const { deviceType } = useResponsiveLayout();
  return getTextStyles(scale, linkColor, deviceType);
}
