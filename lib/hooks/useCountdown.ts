import { useState, useEffect } from 'react';

export function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Don't start timer if initialSeconds is 0 or less
    if (initialSeconds <= 0) {
      setIsFinished(true);
      return;
    }

    setSecondsLeft(initialSeconds); // Reset on initialSeconds change
    setIsFinished(false);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on unmount or if initialSeconds changes
    return () => clearInterval(timer);
  }, [initialSeconds]); // Rerun effect if initialSeconds changes

  return { secondsLeft, isFinished };
} 