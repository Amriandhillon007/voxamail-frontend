// VoxaSuggestionsPanelFloating.jsx
import React, { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const moodMap = {
  positive: { emoji: "😊", label: "Positive Vibes", color: "text-green-600" },
  negative: { emoji: "😞", label: "Stressed Inbox", color: "text-red-600" },
  neutral: { emoji: "😐", label: "Neutral Balance", color: "text-gray-600" },
};

export default function VoxaSuggestionsPanelFloating({ email }) {
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!email) return;
    fetchMoodAnalysis();
  }, [email]);

  const fetchMoodAnalysis = async () => {
    try {
      const res = await fetch(`http://localhost:8000/ai/mood?email=${email}`);
      const data = await res.json();

      if (data?.mood) {
        setMood(data.mood);
        setScore(data.score);
      } else {
        throw new Error("Mood not found.");
      }
    } catch (err) {
      console.error("❌ Mood fetch failed:", err);
      toast.error("Failed to load AI suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (type) => {
    toast(`⚙️ Executing: ${type}`, { icon: "✨" });
    // Add specific route call or trigger here (if needed)
  };

  const suggestionButtons = [
    { label: "🧹 Clear Unread", action: () => handleSuggestion("Clear Unread") },
    { label: "📆 Schedule Follow-up", action: () => handleSuggestion("Schedule Follow-up") },
    { label: "🧠 Summarize All", action: () => handleSuggestion("Summarize Inbox") },
    { label: "🧘‍♀️ Zen Mode", action: () => handleSuggestion("Activate Zen Mode") },
  ];

  const moodInfo = moodMap[mood] || moodMap["neutral"];

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-6 flex flex-col items-start gap-4 animate-fade-in border border-gray-100">
      <div className="flex items-center gap-3">
        <Sparkles className="text-purple-500" />
        <h2 className="text-lg font-bold text-indigo-700">Voxa Suggestions</h2>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" />
          Analyzing inbox mood...
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          <span className={`font-semibold ${moodInfo.color}`}>
            {moodInfo.emoji} {moodInfo.label}
          </span>{" "}
          ({score})
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-2">
        {suggestionButtons.map((s, idx) => (
          <button
            key={idx}
            onClick={s.action}
            className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-2 rounded-xl shadow-sm hover:bg-indigo-100 transition"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
