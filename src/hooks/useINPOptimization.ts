import { useCallback, useRef } from 'react';

/**
 * INP (Interaction to Next Paint) 优化 Hook
 * 
 * 用于优化交互响应性能，减少主线程阻塞
 */

// 使用 requestIdleCallback 或 setTimeout 延迟非关键任务
export function scheduleIdleTask<T extends () => void>(
  callback: T,
  timeout = 2000
): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// 使用 scheduler.yield 或 setTimeout 让出主线程
export async function yieldToMain(): Promise<void> {
  if (typeof window !== 'undefined' && 'scheduler' in window) {
    // @ts-expect-error scheduler.yield is not in all browsers yet
    if (window.scheduler?.yield) {
      // @ts-expect-error
      return window.scheduler.yield();
    }
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

// 批量处理数组，避免阻塞主线程
export async function processInBatches<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize = 10,
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);

    onProgress?.(Math.min(i + batchSize, total), total);

    // 每处理一批后让出主线程
    if (i + batchSize < total) {
      await yieldToMain();
    }
  }

  return results;
}

// 防抖函数优化版
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 100
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// 节流函数优化版
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit = 16 // ~60fps
) {
  const inThrottleRef = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}

// 使用 requestAnimationFrame 优化视觉更新
export function useRAFCallback<T extends (...args: unknown[]) => void>(
  callback: T
) {
  const rafIdRef = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    },
    [callback]
  );
}

// 长任务分割器
export function useTaskSplitter() {
  const isRunningRef = useRef(false);

  const splitTask = useCallback(async <T, R>(
    items: T[],
    processor: (item: T) => R,
    options: {
      batchSize?: number;
      onBatchComplete?: (results: R[], progress: number) => void;
      shouldContinue?: () => boolean;
    } = {}
  ): Promise<R[]> => {
    const {
      batchSize = 5,
      onBatchComplete,
      shouldContinue = () => true,
    } = options;

    if (isRunningRef.current) {
      throw new Error('Task splitter is already running');
    }

    isRunningRef.current = true;
    const results: R[] = [];
    const total = items.length;

    try {
      for (let i = 0; i < total; i += batchSize) {
        if (!shouldContinue()) {
          break;
        }

        const batch = items.slice(i, i + batchSize);
        const batchResults = batch.map(processor);
        results.push(...batchResults);

        const progress = Math.min(i + batchSize, total) / total;
        onBatchComplete?.(batchResults, progress);

        // 让出主线程，允许渲染和交互
        if (i + batchSize < total) {
          await yieldToMain();
        }
      }
    } finally {
      isRunningRef.current = false;
    }

    return results;
  }, []);

  return { splitTask, isRunning: () => isRunningRef.current };
}
