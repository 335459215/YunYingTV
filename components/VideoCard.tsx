import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { API } from '@/services/api';

import VideoCardMobile from './VideoCard.mobile';
import VideoCardTablet from './VideoCard.tablet';
import VideoCardTV from './VideoCard.tv';

/**
 * VideoCard 组件属性接口
 * @interface VideoCardProps
 * @extends {React.ComponentProps<typeof TouchableOpacity>}
 */
interface VideoCardProps extends React.ComponentProps<typeof TouchableOpacity> {
  /** 视频唯一标识 */
  id: string;
  /** 视频源标识 */
  source: string;
  /** 视频标题 */
  title: string;
  /** 海报图片URL */
  poster: string;
  /** 发行年份，可选 */
  year?: string;
  /** 评分，可选 */
  rate?: string;
  /** 源名称，可选 */
  sourceName?: string;
  /** 播放进度 (0-1)，可选 */
  progress?: number;
  /** 已播放时间（秒），可选 */
  playTime?: number;
  /** 当前集索引，可选 */
  episodeIndex?: number;
  /** 总集数，可选 */
  totalEpisodes?: number;
  /** 获取焦点时的回调，可选 */
  onFocus?: () => void;
  /** 播放记录删除时的回调，可选 */
  onRecordDeleted?: () => void;
  /** API 实例 */
  api: API;
  /** 列表中的索引，可选 */
  index?: number;
}

/**
 * 响应式VideoCard组件
 * 根据设备类型自动选择合适的VideoCard实现:
 * - mobile: 移动设备版本
 * - tablet: 平板设备版本
 * - tv: TV设备版本
 *
 * @param {VideoCardProps} props - 组件属性
 * @param {React.Ref} ref - 组件引用
 * @returns {React.ReactElement} 根据设备类型渲染的VideoCard组件
 */
const VideoCard = React.forwardRef<View, VideoCardProps>((props, ref) => {
  const { deviceType } = useResponsiveLayout();

  switch (deviceType) {
    case 'mobile':
      return <VideoCardMobile {...props} ref={ref} />;

    case 'tablet':
      return <VideoCardTablet {...props} ref={ref} />;

    case 'tv':
    default:
      return <VideoCardTV {...props} ref={ref} />;
  }
});

VideoCard.displayName = 'VideoCard';

export type { VideoCardProps };
export default VideoCard;