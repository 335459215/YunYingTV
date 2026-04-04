/**
 * 性能监控工具
 * 监控应用性能，提供优化建议
 */

import Logger from '@/utils/Logger';

const logger = Logger.withTag('PerformanceMonitor');

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private logs: {
    type: string;
    message: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }[] = [];

  /**
   * 开始性能监控
   */
  start(name: string) {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * 结束性能监控
   */
  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    this.log('performance', `${name}: ${metric.duration.toFixed(2)}ms`, {
      duration: metric.duration,
    });

    return metric.duration;
  }

  /**
   * 记录日志
   */
  private log(type: string, message: string, data?: Record<string, unknown>) {
    this.logs.push({
      type,
      message,
      timestamp: Date.now(),
      data,
    });

    // 保持日志数量在合理范围内
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  /**
   * 获取性能报告
   */
  getReport() {
    const metricsArray = Array.from(this.metrics.values());
    const logsArray = [...this.logs];
    const durations = metricsArray
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

    return {
      metrics: metricsArray,
      logs: logsArray,
      summary: {
        totalRequests: durations.length,
        averageDuration:
          durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0,
        slowestRequest:
          metricsArray.find(
            m => m.duration === maxDuration
          )?.name || 'N/A',
        fastestRequest:
          metricsArray.find(
            m => m.duration === minDuration
          )?.name || 'N/A',
      },
    };
  }

  /**
   * 清除监控数据
   */
  clear() {
    this.metrics.clear();
    this.logs.length = 0;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * 错误处理工具
 */
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class ErrorHandler {
  private errors: {
    error: Error;
    context: ErrorContext;
    timestamp: number;
  }[] = [];

  /**
   * 捕获错误
   */
  capture(error: Error, context: ErrorContext = {}) {
    const errorRecord = {
      error,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorRecord);

    // 保持错误数量在合理范围内
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // 开发环境下打印到控制台
    if (__DEV__) {
      logger.error(`[${context.component || 'Unknown'}] ${error.message}`, {
        context,
        stack: error.stack,
      });
    }

    // 可以在这里添加错误上报逻辑
    // this.reportToServer(errorRecord);
  }

  /**
   * 异步错误处理
   */
  async captureAsync(
    promise: Promise<unknown>,
    context: ErrorContext = {}
  ): Promise<unknown> {
    try {
      return await promise;
    } catch (error) {
      this.capture(error instanceof Error ? error : new Error(String(error)), context);
      throw error;
    }
  }

  /**
   * 获取错误报告
   */
  getReport(): {
    total: number;
    recent: {
      message: string;
      component?: string;
      timestamp: number;
    }[];
  } {
    return {
      total: this.errors.length,
      recent: this.errors.slice(-10).map(err => ({
        message: err.error.message,
        component: err.context.component,
        timestamp: err.timestamp,
      })),
    };
  }

  /**
   * 清除错误记录
   */
  clear() {
    this.errors.length = 0;
  }
}

export const errorHandler = new ErrorHandler();

/**
 * 内存管理工具
 */
class MemoryManager {
  private subscriptions: Set<() => void> = new Set();

  /**
   * 注册清理函数
   */
  subscribe(cleanup: () => void) {
    this.subscriptions.add(cleanup);
  }

  /**
   * 取消订阅
   */
  unsubscribe(cleanup: () => void) {
    this.subscriptions.delete(cleanup);
  }

  /**
   * 清理所有资源
   */
  cleanup() {
    for (const cleanup of this.subscriptions) {
      try {
        cleanup();
      } catch (error) {
        logger.error('Cleanup failed:', error);
      }
    }
    this.subscriptions.clear();
  }

  /**
   * 获取订阅数量
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

export const memoryManager = new MemoryManager();

/**
 * 缓存管理工具
 */
class CacheManager {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: unknown, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string) {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    total: number;
    size: number;
  } {
    return {
      total: this.cache.size,
      size: JSON.stringify(Array.from(this.cache.entries())).length,
    };
  }
}

export const cacheManager = new CacheManager();
