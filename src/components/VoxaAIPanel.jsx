import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Brain,
  Calendar,
  Trash2,
  Mic,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import GroupedEmailResults from "./GroupedEmailResults";
import VMLoader from "./VMLoader";

export default function VoxaAIPanel({ accessToken, userEmail, onRelayCommand }) {
  const [greeting, setGreeting] = useState("Hey!");
  const [loadingAction, setLoadingAction] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customReply, setCustomReply] = useState(null);
  const [groupedResults, setGroupedResults] = useState([]);
  const [summaryText, setSummaryText] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("You're up early 🌒");
    else if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 17) setGreeting("Good Afternoon 🌤️");
    else if (hour < 21) setGreeting("Good Evening 🌙");
    else setGreeting("Late Night Focus 🌌");
  }, []);

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    setLoadingAction("CustomPrompt");
    try {
      const res = await fetch("http://localhost:8000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt, email: userEmail }),
      });
      const data = await res.json();
      setCustomReply(data.response || "No AI response.");
      if (data.grouped_emails) setGroupedResults(data.grouped_emails);
    } catch (err) {
      console.error("❌ Prompt error:", err);
      toast.error("AI failed to respond.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSummarize = async () => {
    setLoadingAction("Summarize");
    try {
      const res = await fetch("http://localhost:8000/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummaryText(data.summary);
        toast.success("Summary ready!");
      } else {
        setSummaryText("No summary returned.");
        toast("No relevant emails found.");
      }
    } catch (err) {
      console.error("❌ Summarize error:", err);
      toast.error("Failed to summarize.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeletePromos = async () => {
    setLoadingAction("DeletePromos");
    try {
      const res = await fetch("http://localhost:8000/emails/promos-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const previewRes = await res.json();
      const preview = previewRes.promos || [];

      if (!Array.isArray(preview) || preview.length === 0) {
        toast("No promotional emails found.");
        return;
      }

      const confirmed = confirm(`Delete ${preview.length} promo emails?`);
      if (!confirmed) return;

      const deleteRes = await fetch("http://localhost:8000/emails/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          message_ids: preview.map((e) => e.id),
        }),
      });

      const data = await deleteRes.json();

      if (deleteRes.ok) {
        console.log("✅ Deleted promos response:", data);
        toast.success(`Deleted ${data.deleted || preview.length} emails.`);
      } else {
        console.error("❌ Delete promos failed:", data);
        toast.error("Failed to delete promos.");
      }
    } catch (err) {
      console.error("❌ Promo delete error:", err);
      toast.error("Failed to delete promos.");
    } finally {
      setLoadingAction(null);
    }
  };

  const suggestions = [
    { icon: <Sparkles size={20} />, text: "Summarize This Week", action: handleSummarize },
    {
      icon: <MessageSquare size={20} />,
      text: "Mood-Based Inbox Summary",
      action: async () => {
        setLoadingAction("Mood");
        try {
          const res = await fetch(`http://localhost:8000/ai/mood?email=${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          const summary = `Inbox Mood: ${data.mood.toUpperCase()} (${data.score}) — across ${data.email_count} emails.`;
          toast.success("Mood summary ready.");
          setSummaryText(summary);
        } catch (err) {
          console.error("❌ Mood error:", err);
          toast.error("Mood analysis failed.");
        } finally {
          setLoadingAction(null);
        }
      },
    },
    { icon: <Trash2 size={20} />, text: "Delete Promotional Emails", action: handleDeletePromos },
    { icon: <Calendar size={20} />, text: "Show Upcoming Meetings", action: () => toast("📅 Meetings coming soon.") },
    { icon: <Brain size={20} />, text: "Prioritize Important Senders", action: () => toast("Ranking priority senders...") },
    { icon: <Mic size={20} />, text: "Voice-Only Inbox Mode", action: () => toast("🔊 Voice inbox coming soon.") },
  ];

  return (
    <motion.div
      className="flex flex-col h-full w-full p-6 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1">
          <div className="bg-white rounded-full p-2">
            <Brain className="text-indigo-600" size={24} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Voxa AI</h2>
          <p className="text-sm text-gray-500 -mt-1">{greeting} – Smart Inbox Brain 🧠</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-2">
        <h3 className="text-sm text-gray-600 font-semibold mb-3">Suggestions</h3>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              disabled={loadingAction !== null}
              onClick={item.action}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-200 ${
                loadingAction === item.text || loadingAction === item.action.name
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
              }`}
            >
              {item.icon}
              <span>{item.text}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {loadingAction && <VMLoader text={loadingAction} />}

      {summaryText && (
        <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm whitespace-pre-wrap animate-fade-in">
          {summaryText}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm text-gray-600 font-semibold mb-2">Ask Voxa Anything</h3>
        <div className="flex gap-2">
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="e.g. Who sent me the most emails last week?"
          />
          <button
            onClick={handleCustomPrompt}
            disabled={loadingAction !== null}
            className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700"
          >
            Ask
          </button>
        </div>
        {customReply && (
          <div className="mt-3 text-sm bg-gray-50 p-3 rounded-xl border border-gray-200 whitespace-pre-wrap">
            {customReply}
          </div>
        )}
        {groupedResults.length > 0 && (
          <GroupedEmailResults groups={groupedResults} accessToken={accessToken} userEmail={userEmail} />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-gray-400 italic text-xs">Voxa AI is learning from your inbox...</p>
      </div>
    </motion.div>
  );
}
