import React, { useState } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PromptInputBox({ userEmail }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    if (!input.trim()) return toast.error("Enter a prompt first");
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("http://localhost:8000/ai/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, prompt: input }),
      });
      const data = await res.json();
      if (data.result) {
        setResponse(data.result);
      } else {
        toast.error("No response from AI");
      }
    } catch (err) {
      console.error("Prompt error:", err);
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ask Voxa AI anything:
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. summarize recent emails from Dropbox"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
        </button>
      </div>
      {response && (
        <div className="mt-4 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
          {response}
        </div>
      )}
    </div>
  );
}
