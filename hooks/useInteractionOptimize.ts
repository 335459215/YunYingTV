/**
 * 交互优化 Hook
 * 改进用户体验和响应速度
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { InteractionManager, PanResponder } from 'react-native';
import Logger from '@/utils/Logger';

const logger = Logger.withTag('InteractionOptimize');

/**
 * 快速响应 Hook - 立即反馈，后台处理
 */
export function useOptimisticUpdate<T>(
  action: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (data: T) => {
      setLoading(true);
      setError(null);

      try {
        await action(data);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        // 使用 InteractionManager 确保 UI 优先
        InteractionManager.runAfterInteractions(() => {
          setLoading(false);
        });
      }
    },
    [action, onSuccess, onError]
  );

  return { execute, loading, error };
}

/**
 * 触摸反馈 Hook
 */
export function useTouchFeedback(scale: number = 0.95) {
  const [pressed, setPressed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setPressed(true);
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: () => {
        setPressed(false);
      },
      onPanResponderTerminate: () => {
        setPressed(false);
      },
    })
  ).current;

  return {
    panResponder: panResponder.panHandlers,
    pressed,
    style: {
      transform: [{ scale: pressed ? scale : 1 }],
      opacity: pressed ? 0.7 : 1,
    },
  };
}

/**
 * 延迟加载 Hook - 避免初始加载卡顿
 */
export function useDeferredLoading<T>(
  factory: () => Promise<T>,
  deps: readonly unknown[] = [],
  delay: number = 100
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeout: NodeJS.Timeout;

    const load = async () => {
      setLoading(true);
      try {
        const result = await factory();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Load failed'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    timeout = setTimeout(() => {
      load();
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
    // This hook intentionally lets callers control the extra dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory, delay, ...deps]);

  return { data, loading, error };
}

/**
 * 批量处理 Hook
 */
export function useBatchProcessor<T>(
  processor: (items: T[]) => Promise<void>,
  batchSize: number = 10,
  delay: number = 100
) {
  const queueRef = useRef<T[]>([]);
  const processingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) {
      return;
    }

    processingRef.current = true;

    while (queueRef.current.length > 0) {
      const batch = queueRef.current.splice(0, batchSize);
      
      try {
        await processor(batch);
      } catch (error) {
        logger.error('Batch processing failed:', error);
        // 失败时重新加入队列
        queueRef.current.unshift(...batch);
      }

      if (queueRef.current.length > 0) {
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, delay);
        });
      }
    }

    processingRef.current = false;
  }, [processor, batchSize, delay]);

  const add = useCallback((item: T) => {
    queueRef.current.push(item);

    if (!processingRef.current) {
      void processQueue();
    }
  }, [processQueue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    add,
    queueLength: queueRef.current.length,
    isProcessing: processingRef.current,
  };
}

/**
 * 手势优化 Hook
 */
export function useOptimizedGesture(
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold: number = 50
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        touchStart.current = {
          x: gestureState.x0,
          y: gestureState.y0,
        };
      },
      onPanResponderMove: (_, gestureState) => {
        // 可以添加实时反馈
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!touchStart.current) return;

        const dx = gestureState.moveX - touchStart.current.x;
        const dy = gestureState.moveY - touchStart.current.y;

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
          if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            onSwipe?.(dx > 0 ? 'right' : 'left');
          } else {
            // 垂直滑动
            onSwipe?.(dy > 0 ? 'down' : 'up');
          }
        }

        touchStart.current = null;
      },
    })
  ).current;

  return panResponder.panHandlers;
}

/**
 * 内存优化 - 清理不需要的数据
 */
export function useMemoryCleanup(cleanupFn: () => void, deps: readonly unknown[] = []) {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
    // This hook intentionally lets callers control the extra dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanupFn, ...deps]);
}

/**
 * 网络状态感知 Hook
 */
export function useNetworkAwareRequest<T>(
  request: () => Promise<T>,
  options: {
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
  } = {}
) {
  const { retryCount = 3, retryDelay = 1000, timeout = 10000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let i = 0; i < retryCount; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const result = await request();
        clearTimeout(timeoutId);

        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Request failed');
        
        if (i < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }

    setError(lastError);
    setLoading(false);
    throw lastError;
  }, [request, retryCount, retryDelay, timeout]);

  return { data, loading, error, execute };
}
