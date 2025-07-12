import { useState, useEffect } from "react";

// Constants
const STORAGE_KEY = "voxamail_sender_quota";
const MAX_ACTIONS_PER_SENDER = 3;
const MAX_EMAILS_PER_ACTION = 20;

export const useSenderQuota = (sender) => {
  const [remaining, setRemaining] = useState(MAX_ACTIONS_PER_SENDER);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Clean up if outdated
        if (parsed.date !== today) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, usage: {} }));
        } else {
          setRemaining(
            Math.max(0, MAX_ACTIONS_PER_SENDER - (parsed.usage[sender] || 0))
          );
        }
      } catch (err) {
        console.warn("⚠️ Quota storage corrupted, resetting.");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, usage: {} }));
      }
    } else {
      // First time today
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, usage: {} }));
    }
  }, [sender]);

  const canProceed = () => remaining > 0;

  const recordUsage = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : { date: today, usage: {} };

    if (parsed.date !== today) {
      parsed.date = today;
      parsed.usage = {};
    }

    parsed.usage[sender] = (parsed.usage[sender] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setRemaining(Math.max(0, MAX_ACTIONS_PER_SENDER - parsed.usage[sender]));
  };

  return {
    canProceed,
    recordUsage,
    remaining,
    maxPerSender: MAX_ACTIONS_PER_SENDER,
    maxEmailsPerAction: MAX_EMAILS_PER_ACTION,
  };
};
