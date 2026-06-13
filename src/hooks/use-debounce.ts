import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delayMs`
 * have elapsed without a new value being received.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
