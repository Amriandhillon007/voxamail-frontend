import React, { useState, useEffect } from "react";
import { RefreshCcw, WandSparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function ReplySuggestionsPanel({ email, messageId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("neutral");

  useEffect(() => {
    if (email && messageId) {
      fetchSuggestions();
    }
  }, [email, messageId, tone]);

 const fetchSuggestions = async () => {
  if (!email || !messageId) return;

  try {
    const res = await fetch("http://localhost:8000/ai/suggest-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message_id: messageId }),
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (data?.replies?.length) {
        setSuggestions(data.replies);
      } else {
        setSuggestions([]);
        toast("No smart replies available for this email.");
      }
    } catch (jsonErr) {
      console.error("❌ AI reply JSON parse error:", jsonErr);
      console.error("Raw response:", text);
      toast.error("AI failed to generate replies.");
    }
  } catch (err) {
    console.error("❌ AI reply error:", err);
    toast.error("Error while getting AI reply suggestions.");
  }
};

  const tones = ["neutral", "friendly", "formal", "assertive"];

  return (
    <div className="mt-4 bg-gray-50 border border-indigo-100 rounded-xl p-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-indigo-700 flex items-center gap-1">
          <WandSparkles className="w-4 h-4 text-yellow-500" />
          AI Reply Suggestions
        </h4>
        <button
          onClick={fetchSuggestions}
          disabled={loading || !messageId}
          className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
        >
          <RefreshCcw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 text-xs mb-3 flex-wrap">
        {tones.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-2 py-1 rounded-full border transition ${
              tone === t
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-indigo-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 animate-pulse">
          🧠 Generating smart replies...
        </p>
      ) : suggestions.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No suggestions yet. Try refreshing.
        </p>
      )}
    </div>
  );
}
