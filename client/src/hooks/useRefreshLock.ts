import { useCallback, useRef, useState } from 'react';

export function useRefreshLock() {
  const lockedRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runRefresh = useCallback(async (task: () => Promise<void>): Promise<boolean> => {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    setIsRefreshing(true);
    try {
      await task();
      return true;
    } finally {
      lockedRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  return { isRefreshing, runRefresh, isLocked: () => lockedRef.current };
}
