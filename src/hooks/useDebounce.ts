import { useEffect, useRef } from 'react';

/**
 * Returns a debounced version of the provided callback.
 * The callback is only called after `delay` ms of inactivity.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep the ref current so the debounced fn always calls the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return (...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}
