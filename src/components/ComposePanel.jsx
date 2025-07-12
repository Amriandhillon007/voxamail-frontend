import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const ComposePanel = ({ userEmail, injectedReply = "" }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [tone, setTone] = useState("friendly");
  const [loading, setLoading] = useState(false);

  // ✅ If reply is injected from VoxaAIPanel
  useEffect(() => {
    if (injectedReply) {
      setSuggestion(injectedReply);
      toast.success("📥 Reply imported from AI Panel");
    }
  }, [injectedReply]);

  const sendEmail = async () => {
    if (!to || !subject || !body) return toast.error("All fields required.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          to: to.split(",").map((e) => e.trim()),
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✉️ Email sent successfully!");
        setTo("");
        setSubject("");
        setBody("");
        setSuggestion("");
      } else {
        toast.error(data.error || "Failed to send email.");
      }
    } catch {
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestion = async () => {
    if (!subject && !body) return toast.error("Add subject or content for context");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          prompt: `Suggest a "${tone}" reply to this:\nSubject: ${subject}\n\n${body}`,
        }),
      });
      const data = await res.json();
      if (data.response) {
        setSuggestion(data.response);
        toast.success("🤖 Suggested reply ready");
      } else {
        toast.error("No suggestion returned.");
      }
    } catch {
      toast.error("Suggestion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-indigo-700">📝 Compose Email</h2>

      <input
        type="text"
        placeholder="To: comma-separated"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <textarea
        rows={6}
        placeholder="Email body..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500">Tone:</label>
        {['friendly', 'formal', 'assertive'].map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`text-xs px-2 py-1 rounded-full border ${
              tone === t ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button
          onClick={generateSuggestion}
          disabled={loading}
          className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 text-xs rounded shadow"
        >
          🤖 Suggest Reply
        </button>
      </div>

      {suggestion && (
        <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap">
          <strong className="block mb-1 text-gray-500">💡 Suggested:</strong>
          {suggestion}
          <div className="mt-2 text-right">
            <button
              onClick={() => setBody(suggestion)}
              className="text-indigo-500 text-xs hover:underline"
            >
              Use Suggestion
            </button>
          </div>
        </div>
      )}

      <button
        onClick={sendEmail}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold"
      >
        {loading ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
};

export default ComposePanel;
