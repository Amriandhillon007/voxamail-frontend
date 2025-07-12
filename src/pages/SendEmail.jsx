// 📤 SendEmail.jsx — Gmail API Email Composer (Upgraded)
import React, { useState } from "react";
import toast from "react-hot-toast";

const SendEmail = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const access_token = localStorage.getItem("access_token");
    const email = localStorage.getItem("email");

    if (!access_token || !email) {
      toast.error("❌ Missing login session. Please sign in again.");
      return;
    }

    if (!to.trim()) {
      toast.error("Recipient email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          to: to.split(",").map((addr) => addr.trim()), // multiple emails support
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        toast.success("✅ Email sent successfully!");
        setTo("");
        setSubject("");
        setBody("");
      } else {
        toast.error(`❌ Send failed: ${data.details?.error || "Unknown error"}`);
        console.error("Send error:", data);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-700">✉️ Compose Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Recipient (comma-separated for multiple)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded p-2"
        />
        <textarea
          placeholder="Write your message here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border rounded p-2"
          rows={6}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  );
};

export default SendEmail;
