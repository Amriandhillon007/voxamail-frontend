import React, { useState, useRef, useEffect } from "react";
import { executeAICommand } from "../utils/api";
import { useRateLimitedAction } from "../hooks/useRateLimiter";
import toast from "react-hot-toast";

const ChatBox = ({ accessToken }) => {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Auto scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const runCommand = async (message) => {
    if (!accessToken || accessToken === "null") {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "🔒 You are not authenticated. Please log in again to use the AI assistant.",
        },
      ]);
      return;
    }

    setChatLog((prev) => [...prev, { sender: "user", text: message }]);
    setIsLoading(true);

    try {
      const result = await executeAICommand(accessToken, message);
      console.log("🧠 AI Command Result:", result);

      if (result.parsed && !result.parsed.error) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: (
              <>
                <div className="font-semibold">🧠 Parsed Command:</div>
                <pre className="bg-gray-100 text-xs rounded p-2 mt-1 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result.parsed, null, 2)}
                </pre>
              </>
            ),
          },
        ]);
      } else {
        const errorMsg =
          result.parsed?.error || "⚠️ I couldn’t understand that. Try rephrasing your command.";
        setChatLog((prev) => [...prev, { sender: "ai", text: errorMsg }]);
        return;
      }

      // ✅ Display execution result
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: (
            <>
              <div className="font-semibold">✅ Execution Result:</div>
              <pre className="bg-green-100 text-xs rounded p-2 mt-1 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(result.execution, null, 2)}
              </pre>
            </>
          ),
        },
      ]);
    } catch (error) {
      console.error("❌ ChatBox AI Error:", error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        "Unexpected error occurred while talking to AI.";
      setChatLog((prev) => [...prev, { sender: "ai", text: `❌ ${msg}` }]);
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

  const handleClear = () => setChatLog([]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6 w-full">
      <h3 className="font-semibold text-lg mb-2">💬 VoxaMail AI Assistant</h3>

      <div className="h-64 overflow-y-auto bg-gray-100 p-3 rounded mb-4 space-y-3 scroll-smooth">
        {chatLog.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.sender === "user" ? "text-black" : "text-green-800"
            }`}
          >
            <div className="font-semibold mb-1">
              {msg.sender === "user" ? "🧑 You:" : "🤖 VoxaMail:"}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 mt-2">
            🌀 VoxaMail is processing your request...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. mark all Uber emails from last month as read"
          className="flex-1 border rounded-lg p-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-white transition ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "Thinking..." : "Execute"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400"
        >
          Clear
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
