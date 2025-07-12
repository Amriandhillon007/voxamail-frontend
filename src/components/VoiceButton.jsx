// frontend/src/components/VoiceButton.jsx – ✅ Phase 6.6 Voice Reader Assistant
import React, { useState } from "react";
import { readEmailAloud, stopReading, getVoiceOptions } from "../utils/tts";

const VoiceButton = ({ emails }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("coqui-default");
  const [status, setStatus] = useState("");
  const [cancelRequested, setCancelRequested] = useState(false);

  const speak = async (email) => {
    if (!email) return;

    setSpeaking(true);
    setStatus("🔊 Reading selected email...");

    await readEmailAloud(email, selectedVoice, () => {
      setSpeaking(false);
      setStatus("✅ Finished reading.");
    });
  };

  const stopSpeaking = () => {
    stopReading();
    setCancelRequested(true);
    setSpeaking(false);
    setStatus("🛑 Reading stopped.");
  };

  const handleReadAll = async () => {
    if (!emails || emails.length === 0) return;

    setSpeaking(true);
    setCancelRequested(false);
    setStatus("🔁 Reading all emails...");

    for (let i = 0; i < emails.length; i++) {
      if (cancelRequested) break;

      const email = emails[i];
      if (!email || !email.subject || !email.snippet) continue;

      setStatus(`📧 Reading ${i + 1} of ${emails.length}...`);

      await new Promise((resolve) => {
        readEmailAloud(email, selectedVoice, resolve);
      });

      await new Promise((res) => setTimeout(res, 500));
    }

    setSpeaking(false);
    setCancelRequested(false);
    setStatus("✅ Done reading all.");
  };

  return (
    <div className="mt-6 bg-white p-4 rounded-xl shadow text-center max-w-xl mx-auto">
      <h3 className="font-semibold text-gray-700 mb-2">🔊 AI Voice Assistant</h3>

      {emails.length === 0 ? (
        <p className="text-sm text-gray-500 italic mb-4">📭 No emails available to read.</p>
      ) : (
        <select
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="p-2 w-full rounded border text-sm mb-3"
        >
          <option value="">-- Select an Email to Read --</option>
          {emails.map((email, idx) => (
            <option key={idx} value={idx}>
              {email.subject?.slice(0, 60) || "No subject"}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-3">
        <button
          onClick={() => speak(emails[selectedIndex])}
          disabled={selectedIndex === null}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ▶️ Read Selected
        </button>

        <button
          onClick={handleReadAll}
          disabled={emails.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📢 Read All
        </button>

        <button
          onClick={stopSpeaking}
          className={`${
            speaking ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"
          } text-white px-4 py-2 rounded`}
        >
          🛑 Stop
        </button>
      </div>

      <div className="text-left mb-2">
        <label className="block text-sm font-medium mb-1">🎙️ Choose Voice:</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-2 rounded border"
        >
          {getVoiceOptions().map((voice) => (
            <option key={voice.value} value={voice.value}>
              {voice.label}
            </option>
          ))}
        </select>
      </div>

      {status && (
        <div className="mt-3 text-indigo-600 font-medium animate-pulse">
          {status}
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
