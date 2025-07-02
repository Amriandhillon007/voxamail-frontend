import { useState, useEffect } from "react";

const RATE_LIMIT_KEY = "voxamail_usage";
const DAILY_LIMIT = 30;
const COOLDOWN_MS = 3000;

export const useRateLimiter = () => {
  const [lastActionTime, setLastActionTime] = useState(0);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const today = new Date().toDateString();

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setUsage(parsed.count);
      } else {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: 0 }));
        setUsage(0);
      }
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const canProceed = () => {
    const now = Date.now();
    const cooldownPassed = now - lastActionTime > COOLDOWN_MS;

    if (usage >= DAILY_LIMIT) return false;
    if (!cooldownPassed) return false;
    return true;
  };

  const recordUsage = () => {
    const today = new Date().toDateString();
    const newCount = usage + 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: today, count: newCount }));
    setUsage(newCount);
    setLastActionTime(Date.now());
  };

  return { canProceed, recordUsage, usageInlineStart: DAILY_LIMIT - usage };
};
export const useRateLimitedAction = (action) => {
  const { canProceed, recordUsage } = useRateLimiter();

  const executeAction = async (...args) => {
    if (!canProceed()) {
      alert(`🚫 Rate limit exceeded. Try again later.`);
      return;
    }

    try {
      await action(...args);
      recordUsage();
    } catch (error) {
      console.error("Error executing action:", error);
      alert("❌ Action failed. Please try again.");
    }
  };

  return executeAction;
};