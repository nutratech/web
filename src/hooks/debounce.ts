import { useEffect, useState } from "react";

// exported for testing purposes
export function debounceEffectHandler<T>(
  setValue: (val: T) => void,
  value: T,
  delay: number
): NodeJS.Timeout | number | string | undefined {
  // Update debounced value after delay
  return setTimeout(() => {
    setValue(value);
  }, delay);
}

// exported for testing purposes
export function cleanupDebounceEffect(
  timeoutId: NodeJS.Timeout | number | string | undefined
): void {
  clearTimeout(timeoutId);
}

// Hook
export default function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const timeoutId = debounceEffectHandler(setDebouncedValue, value, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return (): void => {
        cleanupDebounceEffect(timeoutId);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
