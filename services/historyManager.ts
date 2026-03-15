import { PlayRecord, PlayRecordManager } from './storage';
import Logger from '@/utils/Logger';

const logger = Logger.withTag('HistoryManager');

export interface ContinuationItem {
  source: string;
  id: string;
  title: string;
  play_time: number;
  total_time: number;
  index: number;
  source_name: string;
}

class HistoryManager {
  private static instance: HistoryManager;

  private constructor() {}

  public static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager();
    }
    return HistoryManager.instance;
  }

  /**
   * 获取所有播放记录
   */
  public async getAllPlayRecords(): Promise<PlayRecord[]> {
    try {
      const records = await PlayRecordManager.getAll();
      return Object.values(records)
        .sort((a, b) => (b.save_time || 0) - (a.save_time || 0));
    } catch {
      return [];
    }
  }

  /**
   * 获取需要续播的记录
   * 定义：观看进度<95%视为未完全观看
   */
  public async getContinuationItem(): Promise<ContinuationItem | null> {
    try {
      const records = await this.getAllPlayRecords();
      
      // 筛选未完全观看的记录（观看进度<95%）
      const unfinishedRecords = records.filter(record => {
        if (!record.total_time || record.total_time === 0) return false;
        const progress = record.play_time / record.total_time;
        return progress < 0.95;
      });
      
      if (unfinishedRecords.length === 0) {
        logger.info('No unfinished play records found');
        return null;
      }
      
      // 取第一个未完全观看的记录
      const firstUnfinished = unfinishedRecords[0];
      
      // 解析key获取source和id
      const keyParts = Object.entries(await PlayRecordManager.getAll())
        .find(([_, record]) => 
          record.title === firstUnfinished.title && 
          record.source_name === firstUnfinished.source_name
        )?.[0]?.split('+');
      
      if (!keyParts || keyParts.length < 2) {
        logger.error('Failed to parse source and id from play record key');
        return null;
      }
      
      const [source, id] = keyParts;
      
      return {
        source,
        id,
        title: firstUnfinished.title,
        play_time: firstUnfinished.play_time,
        total_time: firstUnfinished.total_time,
        index: firstUnfinished.index - 1, // 转换为0-based索引
        source_name: firstUnfinished.source_name,
      };
    } catch (error) {
      logger.error('Failed to get continuation item:', error);
      return null;
    }
  }

  /**
   * 检查是否有未完全观看的记录
   */
  public async hasUnfinishedRecords(): Promise<boolean> {
    const continuationItem = await this.getContinuationItem();
    return !!continuationItem;
  }
}

export default HistoryManager.getInstance();
