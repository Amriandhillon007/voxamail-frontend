// ✅ useRateLimiter.js – Phase 6.6 Upgrade: Daily Usage + Cooldown Control
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const RATE_LIMIT_KEY = "voxamail_usage";
const DAILY_LIMIT = 30;
const COOLDOWN_MS = 3000;

export const useRateLimiter = () => {
  const [lastActionTime, setLastActionTime] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);

    try {
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.date === today) {
        setUsageCount(parsed.count);
        setRemaining(Math.max(0, DAILY_LIMIT - parsed.count));
      } else {
        resetUsage(today);
      }
    } catch (err) {
      console.warn("⚠️ Corrupted usage data, resetting.");
      resetUsage(today);
    }
  }, []);

  const resetUsage = (today) => {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: 0 }));
    setUsageCount(0);
    setRemaining(DAILY_LIMIT);
  };

  const canProceed = () => {
    const now = Date.now();
    const cooldownPassed = now - lastActionTime > COOLDOWN_MS;
    return usageCount < DAILY_LIMIT && cooldownPassed;
  };

  const recordUsage = () => {
    const today = new Date().toDateString();
    const updatedCount = usageCount + 1;

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: updatedCount }));
    setUsageCount(updatedCount);
    setRemaining(Math.max(0, DAILY_LIMIT - updatedCount));
    setLastActionTime(Date.now());
  };

  return {
    canProceed,
    recordUsage,
    usageCount,
    remaining,
  };
};

// ✅ Wrap an action with built-in rate limiting
export const useRateLimitedAction = (action, options = {}) => {
  const { canProceed, recordUsage, remaining } = useRateLimiter();
  const errorMessage = options.errorMessage || "🚫 Daily limit reached or you're clicking too fast.";

  const executeAction = async (...args) => {
    if (!canProceed()) {
      toast.error(errorMessage);
      return;
    }

    try {
      await action(...args);
      recordUsage();
    } catch (err) {
      console.error("❌ Failed to run rate-limited action:", err);
      toast.error("⚠️ Something went wrong. Try again.");
    }
  };

  return {
    run: executeAction,
    remaining,
  };
};
