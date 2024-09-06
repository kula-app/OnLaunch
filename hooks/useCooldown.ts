import { useEffect, useState } from "react";

/**
 * Creates a cooldown timer that counts down from the given number of seconds.
 *
 * @param cooldownSeconds The number of seconds to count down from. If an array is provided, the cooldown will use the next value in the array each time it is started.
 */
export const useCooldown = (
  cooldownSeconds: number | number[]
): {
  seconds: number;
  isActive: boolean;
  start: () => void;
} => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const start = () => {
    // If the number of attempts exceeds the number of cooldowns, use the last cooldown
    let startSeconds = 0;
    if (Array.isArray(cooldownSeconds)) {
      if (attempts >= cooldownSeconds.length) {
        startSeconds = cooldownSeconds[cooldownSeconds.length - 1];
      } else {
        startSeconds = cooldownSeconds[attempts];
      }
    } else {
      startSeconds = cooldownSeconds;
    }
    setSeconds(startSeconds);
    setIsActive(true);
    setAttempts(attempts + 1);
  };

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setIsActive(false);
    }
  }, [seconds]);

  return { seconds, isActive, start };
};
