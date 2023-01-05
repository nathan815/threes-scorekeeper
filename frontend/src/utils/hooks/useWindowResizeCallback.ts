import { debounce } from 'lodash';
import { useEffect } from 'react';

/**
 * Custom React hook for setting up widnow resize callback.
 *
 * Handles debouncing and cleans up.
 *
 * @param callback The function to call whenever the window is resized
 */
export function useWindowResizeCallback(callback: () => void) {
  useEffect(() => {
    const debouncedCallback = debounce(callback, 100);
    debouncedCallback();
    window.addEventListener('resize', debouncedCallback);
    return () => window.removeEventListener('reisze', debouncedCallback);
  }, [callback]);
}
