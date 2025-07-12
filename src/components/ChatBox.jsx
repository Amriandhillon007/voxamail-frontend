import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { executeAICommand } from "../utils/api";
import { summarizeEmails } from "../utils/ai";
import { speakText, stopReading, isCurrentlySpeaking } from "../utils/tts";
import { useRateLimitedAction } from "../hooks/useRateLimiter";

function ChatBox({ accessToken, userEmail, filteredEmails = [] }) {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const addMessage = (sender, text) => {
    setChatLog((prev) => [...prev, { sender, text }]);
  };

  const runCommand = async (message) => {
    if (!accessToken || !userEmail || accessToken === "null" || userEmail === "null") {
      addMessage("ai", "🔒 You're not authenticated. Please log in again.");
      return;
    }

    addMessage("user", message);
    setIsLoading(true);

    try {
      const result = await executeAICommand(accessToken, message);

      if (result.parsed && !result.parsed.error) {
        addMessage("ai", (
          <>
            <div className="font-semibold text-green-700">🧠 Parsed:</div>
            <pre className="bg-gray-100 text-xs rounded p-2 mt-1 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.parsed, null, 2)}
            </pre>
          </>
        ));
      } else {
        const errorMsg = result.parsed?.error || "⚠️ I couldn’t understand that. Try rephrasing.";
        addMessage("ai", errorMsg);
        return;
      }

      addMessage("ai", (
        <>
          <div className="font-semibold text-indigo-700">✅ Executed:</div>
          <pre className="bg-green-100 text-xs rounded p-2 mt-1 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result.execution, null, 2)}
          </pre>
        </>
      ));
    } catch (error) {
      console.error("❌ ChatBox Error:", error);
      const msg = error?.response?.data?.error || error?.message || "Unexpected error occurred.";
      addMessage("ai", `❌ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rateLimitedRun = useRateLimitedAction(runCommand);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    rateLimitedRun(trimmed);
  };

  const handleClear = () => {
    setChatLog([]);
    setSummary("");
    stopReading();
    setSpeaking(false);
  };

  const handleSummarize = async () => {
    if (!userEmail || filteredEmails.length === 0) {
      toast.error("📭 No emails to summarize.");
      return;
    }

    setSummarizing(true);
    try {
      const messageIds = filteredEmails.map((e) => e.id);
      const result = await summarizeEmails({ email: userEmail, messageIds });
      setSummary(result);
      toast.success("✅ Summary ready.");
    } catch (err) {
      toast.error("❌ Failed to summarize.");
      console.error("🧠 Summarization error:", err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSpeakSummary = async () => {
    if (!summary) return;

    if (speaking || isCurrentlySpeaking()) {
      stopReading();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    await speakText(summary, "coqui-default", () => setSpeaking(false));
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    toast.success("📋 Summary copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8 w-full border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-indigo-700">💬 VoxaMail AI Assistant</h3>

      <div className="h-72 overflow-y-auto bg-gray-50 p-4 rounded-md mb-4 space-y-4 scroll-smooth text-sm border border-gray-200">
        {chatLog.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-md ${
              msg.sender === "user"
                ? "bg-indigo-100 text-indigo-900 self-end"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            <div className="font-semibold mb-1">
              {msg.sender === "user" ? "🧑 You" : "🤖 VoxaMail"}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 italic">🌀 VoxaMail is processing...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. delete last 10 emails from Google"
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          aria-label="AI command input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "..." : "Run"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Clear
        </button>
      </form>

      <div className="flex justify-between items-center">
        <button
          onClick={handleSummarize}
          disabled={summarizing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm"
        >
          {summarizing ? "Summarizing..." : "📋 Summarize Filtered Emails"}
        </button>
        {filteredEmails.length > 0 && (
          <span className="text-xs text-gray-500">Filtered: {filteredEmails.length}</span>
        )}
      </div>

      {summary && (
        <div className="mt-4 bg-emerald-50 text-gray-800 border-l-4 border-emerald-500 p-3 text-sm rounded-lg relative space-y-2">
          <strong className="block mb-1">📄 Summary:</strong>
          {summary.split("\n").map((line, i) => (
            <p key={i} className="whitespace-pre-wrap">{line}</p>
          ))}
          <div className="mt-2 flex gap-4 text-sm">
            <button
              onClick={handleCopySummary}
              className="text-blue-600 hover:underline"
            >
              📋 Copy
            </button>
            <button
              onClick={handleSpeakSummary}
              className="text-purple-600 hover:underline"
            >
              {speaking ? "🛑 Stop" : "🔊 Read Aloud"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
