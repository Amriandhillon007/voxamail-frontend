// ✅ VoxaSuggestionsPanel.jsx — With Smart Follow-Up Suggestions
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, RefreshCcw, MailReply, CalendarClock } from "lucide-react";

const VoxaSuggestionsPanel = ({ userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [score, setScore] = useState(0.0);
  const [tips, setTips] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const moodColors = {
    positive: "from-green-400 to-green-600",
    negative: "from-red-400 to-red-600",
    neutral: "from-yellow-300 to-yellow-500",
  };

  const moodEmoji = {
    positive: "😊",
    negative: "😞",
    neutral: "😐",
  };

  useEffect(() => {
    if (!userEmail) return;
    fetchMoodAnalysis();
    generateAITips();
    fetchFollowups();
  }, [userEmail]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips]);

  const fetchMoodAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/ai/mood?email=${userEmail}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMood(data.mood || "neutral");
      setScore(data.score || 0.0);
      toast.success("🧠 Inbox mood analyzed");
    } catch (err) {
      console.error("⚠️ Mood fetch error:", err);
      toast.error("Could not analyze inbox mood");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowups = async () => {
    try {
      const res = await fetch(`http://localhost:8000/ai/followup?email=${userEmail}`);
      const data = await res.json();
      if (data.suggestions) setFollowups(data.suggestions);
    } catch (err) {
      console.warn("Follow-up fetch failed:", err);
    }
  };

  const generateAITips = () => {
    const suggestions = [
      "📌 You have 5+ unread emails from a frequent sender.",
      "📅 Schedule replies to low-priority threads using the Send Later feature.",
      "🧹 Archive old newsletters that haven’t been opened in 30+ days.",
      "🤖 Use Smart Search to find and bulk delete promotions.",
      "🗓️ Enable Daily Digest for a morning email summary.",
      "🔁 Use Voxa Sidekick to auto-triage your inbox flow.",
    ];
    setTips(suggestions);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl p-5 space-y-5 overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-1">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Voxa Suggestions
          </h2>
          <button
            onClick={fetchMoodAnalysis}
            className="text-sm text-indigo-400 hover:text-indigo-600 flex items-center gap-1"
            title="Refresh Mood"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mood Ring */}
        <div className="flex items-center gap-3 mt-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${moodColors[mood]} flex items-center justify-center text-white shadow-inner`}>
            {moodEmoji[mood]}
          </div>
          <div>
            <p className="text-sm text-gray-500">Mood Detected</p>
            <p className="text-md font-semibold capitalize text-gray-800">
              {loading ? "Analyzing..." : `${mood} (${score > 0 ? "+" : ""}${score.toFixed(2)})`}
            </p>
          </div>
        </div>
      </div>

      {/* AI Tip */}
      <div>
        <p className="text-sm text-gray-500 mt-2 mb-1">⚡ AI Productivity Tip</p>
        <div className="text-sm text-gray-800 bg-gray-100 rounded-xl p-3 shadow-inner transition-all duration-300">
          {tips[currentTipIndex] || "💡 Use VoxaMail's AI tools to clean your inbox."}
        </div>
      </div>

      {/* Smart Follow-Ups */}
      {followups.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mt-4 mb-1">📌 Follow-Up Suggestions</p>
          <ul className="space-y-2 max-h-[180px] overflow-y-auto">
            {followups.map((f, i) => (
              <li key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm shadow hover:shadow-md transition">
                <div className="font-medium text-indigo-800">{f.sender}</div>
                <div className="text-gray-700">{f.subject}</div>
                <div className="text-gray-500 text-xs mt-1">{f.reason} — {f.suggested_action}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoxaSuggestionsPanel;