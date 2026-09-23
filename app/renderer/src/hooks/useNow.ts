import { useEffect, useState } from "react";

/** Current time, re-rendering every second only while `enabled`. */
export const useNow = (enabled: boolean) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!enabled) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  return now;
};
