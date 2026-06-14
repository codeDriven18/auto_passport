import { useCallback, useEffect, useMemo, useState } from 'react';

export function useRelativeLastUpdated() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [lastUpdated]);

  const markUpdated = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const label = useMemo(() => {
    void tick;
    if (!lastUpdated) return null;
    const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    if (seconds < 5) return 'Last updated just now';
    if (seconds === 1) return 'Last updated 1 second ago';
    return `Last updated ${seconds} seconds ago`;
  }, [lastUpdated, tick]);

  return { lastUpdated, markUpdated, label };
}
