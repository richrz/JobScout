import { useEffect, useRef } from 'react';

export function useAutoSave<T>(
  value: T,
  callback: (value: T) => void,
  delay: number = 30000
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = setTimeout(() => {
      callbackRef.current(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
}
