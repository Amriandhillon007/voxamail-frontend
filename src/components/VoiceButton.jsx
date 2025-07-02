// src/components/VoiceButton.jsx
import React, { useState } from "react";

const VoiceButton = ({ emails }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const speakEmail = (email) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Use proper fallbacks
    const sender = email.from || email.sender || "Unknown sender";
    const subject = email.subject || "No subject";
    const snippet = email.snippet || "No preview available";

    console.log("🟢 Reading email:", { sender, subject, snippet });

    const text = `From ${sender}. Subject: ${subject}. Preview: ${snippet}.`;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (e) => {
      console.error("🔴 Speech error:", e.error);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="mt-4 max-w-xl mx-auto text-center">
      <label className="block mb-2 font-medium text-gray-700">
        Select an email to read aloud:
      </label>

      <select
        onChange={(e) => setSelectedIndex(e.target.value)}
        className="p-2 rounded border w-full text-sm"
      >
        <option value="">-- Choose Email --</option>
        {emails.map((email, idx) => (
          <option key={idx} value={idx}>
            {email.subject?.slice(0, 60) || "No subject"}
          </option>
        ))}
      </select>

      <div className="flex justify-center items-center gap-3 mt-3">
        <button
          onClick={() => {
            if (selectedIndex !== null && emails[selectedIndex]) {
              speakEmail(emails[selectedIndex]);
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          🔊 Read Email
        </button>

        <button
          onClick={stopSpeaking}
          disabled={!speaking}
          className={`${
            speaking
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-300 cursor-not-allowed"
          } text-white px-4 py-2 rounded transition`}
        >
          🛑 Stop
        </button>
      </div>

      {speaking && (
        <p className="text-sm text-indigo-600 mt-2 animate-pulse">
          📣 Speaking...
        </p>
      )}
    </div>
  );
};

export default VoiceButton;
