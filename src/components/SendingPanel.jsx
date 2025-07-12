import React, { useState } from "react";

const SendingPanel = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!to || !subject || !body) {
      alert("Please fill in all fields");
      return;
    }

    alert("📤 Simulated send: " + to);
    setTo(""); setSubject(""); setBody("");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-lg font-bold text-indigo-600">📤 Compose Email</h2>
      <input
        type="email"
        placeholder="To"
        className="border p-2 rounded w-full"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        className="border p-2 rounded w-full"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        rows="4"
        placeholder="Body"
        className="border p-2 rounded w-full"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      ></textarea>
      <button
        onClick={handleSend}
        className="w-full bg-indigo-600 text-white p-2 rounded"
      >
        Send Now
      </button>
    </div>
  );
};

export default SendingPanel;
