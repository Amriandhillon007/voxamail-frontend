// ✅ SenderCard.jsx – Smart Sender, Mood, Actions, Playback, Pinning, Density, Urgency, Rich HTML Viewer + Micro Spinner + AI Contact Card Preview
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { speakText, stopReading, isCurrentlySpeaking } from "../utils/tts";
import { Sparkles, Pin } from "lucide-react";
import ReplySuggestionsPanel from "./ReplySuggestionsPanel";

const moodEmojis = {
  positive: "😊",
  negative: "😞",
  urgent: "⚠️",
  neutral: "😐",
};

const moodColors = {
  positive: "text-green-600 bg-green-100",
  negative: "text-red-600 bg-red-100",
  urgent: "text-orange-600 bg-orange-100",
  neutral: "text-gray-600 bg-gray-100",
};

const densityColors = {
  Low: "bg-gray-100 text-gray-500",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-600",
};

function getDensityLevel(count) {
  if (count >= 9) return "High";
  if (count >= 4) return "Medium";
  return "Low";
}

function calculateStats(emails) {
  if (!emails.length) return { frequency: 0, avgReplyTime: "—" };
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const recentEmails = emails.filter(
    (e) => now - e.timestamp * 1000 <= oneWeekMs
  );
  const frequency = recentEmails.length;

  const replies = emails.filter((e) => e.threadId && e.in_reply_to);
  const totalDelays = replies.reduce((sum, e) => {
    const delay = (e.timestamp - (e.replied_to_ts || e.timestamp)) * 1000;
    return sum + delay;
  }, 0);
  const avgMs = replies.length ? totalDelays / replies.length : 0;
  const hours = Math.round(avgMs / (1000 * 60 * 60));
  return {
    frequency,
    avgReplyTime: replies.length ? `${hours}h` : "—",
  };
}

function SenderCard({
  sender,
  userEmail,
  accessToken,
  onRefresh,
  emails: externalEmails = null,
  zenMode,
}) {
  const [expanded, setExpanded] = useState(!!externalEmails);
  const [emails, setEmails] = useState(externalEmails || []);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [expandedEmailId, setExpandedEmailId] = useState(null);
  const [showContactCard, setShowContactCard] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState({
    "📅 Last Week": !!externalEmails,
    "🗓️ Last Month": false,
    "📁 Older": false,
  });
  const [mood, setMood] = useState("neutral");
  const [pinned, setPinned] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const safeMood =
    typeof mood === "string" && moodEmojis[mood] ? mood : "neutral";
  const density = getDensityLevel(emails.length);
  const { frequency, avgReplyTime } = calculateStats(emails);

  useEffect(() => {
    const pinnedSenders = JSON.parse(
      localStorage.getItem("pinned_senders") || "[]"
    );
    setPinned(pinnedSenders.includes(sender));
  }, [sender]);

  const togglePin = () => {
    const pinnedSenders = JSON.parse(
      localStorage.getItem("pinned_senders") || "[]"
    );
    let updated;
    if (pinned) {
      updated = pinnedSenders.filter((s) => s !== sender);
      toast("Sender unpinned");
    } else {
      updated = [...pinnedSenders, sender];
      toast.success("📌 Sender pinned to top");
    }
    localStorage.setItem("pinned_senders", JSON.stringify(updated));
    setPinned(!pinned);
  };

  useEffect(() => {
    if (externalEmails) setEmails(externalEmails);
  }, [externalEmails]);

  useEffect(() => {
    if (zenMode) {
      setExpanded(true);
      setSectionVisibility({
        "📅 Last Week": true,
        "🗓️ Last Month": true,
        "📁 Older": true,
      });
      if (emails.length === 0 && !externalEmails) {
        fetchSenderEmails();
      }
    } else {
      setExpanded(!!externalEmails);
    }
  }, [zenMode]);

  useEffect(() => {
    if (emails.length > 0) fetchMood();
  }, [emails]);

  useEffect(() => {
    const urgentWords = [
      "urgent",
      "asap",
      "immediate",
      "important",
      "deadline",
    ];
    const combined = emails
      .map((e) => e.full_text || e.snippet || "")
      .join(" ")
      .toLowerCase();
    setIsUrgent(urgentWords.some((word) => combined.includes(word)));
  }, [emails]);
  

  async function fetchSenderEmails() {
    if (externalEmails && externalEmails.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/emails/by-sender?email=${encodeURIComponent(
          userEmail
        )}&sender=${encodeURIComponent(sender)}`
      );
      const data = await res.json();
      const seen = new Set();
      const allEmails = [
        ...(data.last_week || []),
        ...(data.last_month || []),
        ...(data.older || []),
      ].filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
      setEmails(allEmails);
    } catch (err) {
      console.error("❌ Fetch sender emails error:", err);
      toast.error("Failed to load sender emails.");
    } finally {
      setLoading(false);
    }
  }

  const fetchMood = async () => {
  const messageIds = emails
    .map((e) => e.id)
    .filter((id) => typeof id === "string" && id.trim().length > 0);

  if (!userEmail || messageIds.length === 0) {
    console.warn("⚠️ Skipping mood fetch: Missing email or message IDs.");
    return;
  }

  const payload = {
    email: userEmail,
    message_ids: messageIds,
  };

  console.log("🧠 Sending mood fetch payload:", payload);

  try {
    const res = await fetch("http://localhost:8000/emails/analyze-mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("❌ Mood fetch failed with backend error:", err);
      return;
    }

    const data = await res.json();
    if (data?.mood) setMood(data.mood);
  } catch (err) {
    console.error("❌ Mood fetch failed:", err);
  }
};



  const toggleExpand = () => {
    if (!expanded && emails.length === 0) {
      fetchSenderEmails();
    }
    setExpanded((prev) => !prev);
  };

  const toggleEmailExpand = async (emailId) => {
    if (expandedEmailId === emailId) {
      setExpandedEmailId(null);
      return;
    }

    const targetIndex = emails.findIndex((e) => e.id === emailId);
    if (emails[targetIndex]?.html_body) {
      setExpandedEmailId(emailId);
      return;
    }

    const { full, html } = await fetchFullText(emailId);
    const updated = [...emails];
    updated[targetIndex].full_text = full;
    updated[targetIndex].html_body = html;
    setEmails(updated);
    setExpandedEmailId(emailId);
  };

  const handleSpeak = async (text, id) => {
    if (speakingId === id || isCurrentlySpeaking()) {
      stopReading();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    await speakText(text, "coqui-default", () => setSpeakingId(null));
  };
 const handleBatchAction = async (action) => {
  const validIds = selected.filter(
    (id) => typeof id === "string" && id.trim().length > 0
  );

  if (validIds.length === 0) {
    toast("No valid emails selected.");
    return;
  }

  const endpoint = action === "read" ? "/emails/mark-read" : "/emails/delete";
  const actionLabel = action === "read" ? "Marked as read" : "Deleted";
  const payload = {
  email: userEmail,
  message_ids: validIds,
};
 if (!userEmail || validIds.length === 0) {
  console.warn("⚠️ Skipping batch action: Missing email or message IDs.");
  return;
}

console.log(`📦 Sending ${action} payload to ${endpoint}:`, payload);
  
  console.log(`📦 Sending ${action} payload to ${endpoint}:`, payload);

  try {
    const res = await fetch(`http://localhost:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("❌ Backend error during batch action:", err);
      throw new Error("Action failed.");
    }

    toast.success(`${actionLabel} ${validIds.length} email(s).`);
    const updatedEmails = emails.filter((e) => !validIds.includes(e.id));
    setEmails(updatedEmails);
    setSelected([]);
    if (onRefresh) onRefresh();
  } catch (err) {
    console.error("❌ Batch action error:", err);
    toast.error(`Failed to ${action} selected emails.`);
  }
};


  const groupEmailsByTime = (emails) => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    return {
      "📅 Last Week": emails.filter((e) => now - e.timestamp * 1000 <= oneWeek),
      "🗓️ Last Month": emails.filter(
        (e) =>
          now - e.timestamp * 1000 > oneWeek &&
          now - e.timestamp * 1000 <= oneMonth
      ),
      "📁 Older": emails.filter((e) => now - e.timestamp * 1000 > oneMonth),
    };
  };

  const grouped = groupEmailsByTime(emails);
  const handleSelect = (emailId) => {
    setSelected((prev) => {
      if (prev.includes(emailId)) {
        return prev.filter((id) => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  return (
    <div
      className={`bg-white rounded-3xl p-5 shadow-xl border ${
        pinned ? "border-yellow-400" : "border-gray-100"
      } mb-6 transition hover:shadow-2xl`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-indigo-700 flex items-center gap-2 relative">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span
            className="truncate max-w-[180px] hover:underline cursor-pointer"
            onClick={() => setShowContactCard(!showContactCard)}
          >
            {sender}
          </span>
          <span
            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${moodColors[safeMood]}`}
          >
            {moodEmojis[safeMood]} {safeMood}
          </span>
          <span
            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${densityColors[density]}`}
          >
            📊 {density}
          </span>
          {isUrgent && (
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              🔴 Urgent
            </span>
          )}

          {showContactCard && (
            <div className="absolute top-8 left-4 bg-white border rounded-xl p-3 shadow-xl z-50 w-60 text-sm">
              <div className="font-bold text-indigo-700">{sender}</div>
              <div className="mt-2">
                📬 Freq (7d): <span className="font-medium">{frequency}</span>
              </div>
              <div>
                ⏱️ Avg. Reply:{" "}
                <span className="font-medium">{avgReplyTime}</span>
              </div>
              <div>
                📈 Mood: {moodEmojis[safeMood]}{" "}
                <span className="font-medium">{safeMood}</span>
              </div>
            </div>
          )}
        </h3>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleExpand}
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
          >
            {loading
              ? "⏳ Loading..."
              : expanded
              ? "Hide Emails"
              : "Show Emails"}
          </button>
          <button
            onClick={togglePin}
            title={pinned ? "Unpin Sender" : "Pin Sender"}
            className={`text-sm px-2 py-1 rounded-full transition cursor-pointer ${
              pinned
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-400 hover:text-yellow-600"
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {loading ? (
            <div className="text-sm text-gray-500 italic mt-2">
              Loading emails...
            </div>
          ) : (
            <>
              <div className="flex gap-4 text-sm mb-3">
                <button
                  onClick={() => handleBatchAction("read")}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 shadow cursor-pointer"
                >
                  ✅ Mark Read ({selected.length})
                </button>
                <button
                  onClick={() => handleBatchAction("delete")}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow cursor-pointer"
                >
                  🗑️ Delete ({selected.length})
                </button>
              </div>

              {Object.entries(grouped).map(([label, items]) => (
                <div key={label} className="mb-4">
                  <button
                    className="text-indigo-500 font-semibold mb-2 hover:underline cursor-pointer"
                    onClick={() =>
                      setSectionVisibility((prev) => ({
                        ...prev,
                        [label]: !prev[label],
                      }))
                    }
                  >
                    {sectionVisibility[label] ? "▼" : "▶"} {label} (
                    {items.length})
                  </button>

                  {sectionVisibility[label] && (
                    <div className="space-y-2 animate-fade-in">
                      {items.map((email) => (
                        <div
                          key={email.id}
                          className="border p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition shadow-sm"
                          onClick={() => toggleEmailExpand(email.id)}
                        >
                          <div className="flex justify-between items-center">
                            <label className="flex gap-2 items-center text-sm font-medium text-gray-800">
                              <input
                                type="checkbox"
                                checked={selected.includes(email.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelect(email.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              {email.subject || "(No Subject)"}
                            </label>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const text = email.full_text || email.snippet;
                                handleSpeak(text, email.id);
                              }}
                              className="text-purple-600 text-xs hover:underline cursor-pointer"
                            >
                              {speakingId === email.id
                                ? "🛑 Stop"
                                : "🔊 Read Aloud"}
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(email.timestamp * 1000).toLocaleString()}
                          </div>
                          {expandedEmailId === email.id && (
                            <div className="mt-2 border-t pt-2 space-y-3">
                              {email.html_body ? (
                                <div
                                  className="text-sm bg-white p-3 rounded shadow-inner border"
                                  dangerouslySetInnerHTML={{
                                    __html: email.html_body,
                                  }}
                                />
                              ) : (
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {email.full_text ||
                                    "No full content available."}
                                </div>
                              )}

                              {email?.id &&
                                (email.full_text || email.snippet) && (
                                  <ReplySuggestionsPanel
                                    email={userEmail}
                                    messageId={email.id}
                                  />
                                )}
                            </div>
                          )}
                          {email.attachments?.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              Attachments:{" "}
                              {email.attachments
                                .map((att) => att.filename)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SenderCard;
