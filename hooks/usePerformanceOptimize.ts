/**
 * 性能优化 Hook 集合
 * 提供 React 性能优化相关的工具函数
 */

import { useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * 防抖 Hook
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );
}

/**
 * 节流 Hook
 * @param func 要执行的函数
 * @param limit 时间限制（毫秒）
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
) {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= limit) {
        lastRunRef.current = now;
        func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = now;
          func(...args);
        }, limit - timeSinceLastRun);
      }
    },
    [func, limit]
  );
}

/**
 * 记忆化 Hook - 深度比较
 * @param value 要记忆的值
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<{ value: T; hash: string } | null>(null);
  
  const hash = useMemo(() => {
    return JSON.stringify(value);
  }, [value]);

  if (!ref.current || ref.current.hash !== hash) {
    ref.current = { value, hash };
  }

  return ref.current.value;
}

/**
 * 懒加载 Hook
 * @param factory 组件工厂函数
 * @param deps 依赖数组
 */
export function useLazyComponent<T>(
  factory: () => T,
  deps: any[] = []
): T | null {
  const componentRef = useRef<T | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      const component = await factory();
      if (mounted) {
        componentRef.current = component as T;
        setLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, deps);

  return loaded ? componentRef.current : null;
}

/**
 * 虚拟列表 Hook - 优化长列表渲染
 * @param items 数据项
 * @param itemHeight 每项高度
 * @param containerHeight 容器高度
 * @param overscan 预加载数量
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const offsetTop = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetTop,
    startIndex,
    endIndex,
    onScroll: useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []),
  };
}

/**
 * 图片懒加载 Hook
 * @param src 图片地址
 * @param placeholder 占位图
 */
export function useLazyLoadImage(src: string, placeholder: string = '') {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    src: loaded ? src : placeholder,
    loaded,
    error,
  };
}

/**
 * 请求竞态处理 Hook
 * @param request 请求函数
 */
export function useLatestRequest<T extends (...args: any[]) => Promise<any>>() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (request: () => Promise<T>, ...args: any[]) => {
      // 取消上一个请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      try {
        return await request();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 请求被取消，不处理
          return null;
        }
        throw error;
      }
    },
    []
  );

  return execute;
}
