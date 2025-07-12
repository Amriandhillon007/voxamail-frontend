// src/components/EmailList.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PauseCircle, PlayCircle } from "lucide-react";
import { readEmailAloud, stopReading } from "../utils/tts";
import SenderCard from "./SenderCard";
import { useRateLimitedAction } from "../hooks/useRateLimiter";
import { useRateLimiter } from "../hooks/useRateLimiter";


function EmailList({ emails = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSender, setExpandedSender] = useState(null);
  const accessToken = localStorage.getItem("access_token");
  const rateLimiter = useRateLimiter();
 const formatSender = (raw) => {
    if (!raw) return "Unknown sender";
    const match = raw.match(/^(.*)<(.+@.+)>$/);
    return match ? match[1].trim() : raw;
  };
  function groupEmailsBySender(emails) {
    const map = {};
    for (const email of emails) {
      const sender = formatSender(email.sender || email.from);
      if (!map[sender]) map[sender] = [];
      map[sender].push(email);
    }
    return Object.entries(map).map(([sender, emails]) => ({ sender, emails }));
  }

  const senderGroups = groupEmailsBySender(emails);

 

  const readSenderEmails = async (senderEmails) => {
    if (!rateLimiter.allow("read-" + senderEmails[0]?.sender, 3)) {
      toast.error("🚫 Daily voice limit reached for this sender (3x)");
      return;
    }

    let index = 0;

    const readNext = () => {
      if (index >= senderEmails.length) {
        setIsPlaying(false);
        setActiveIndex(null);
        return;
      }
      setActiveIndex(index);
      setIsPlaying(true);

      readEmailAloud(senderEmails[index], undefined, () => {
        index += 1;
        readNext();
      });
    };

    stopReading();
    readNext();
  };

  const expandSenderEmails = (sender) => {
    setExpandedSender((prev) => (prev === sender ? null : sender));
  };

  const handleTogglePlay = async (email, index) => {
    if (activeIndex === index && isPlaying) {
      stopReading();
      setIsPlaying(false);
      setActiveIndex(null);
    } else {
      stopReading();
      setActiveIndex(index);
      setIsPlaying(true);

      await readEmailAloud(email, undefined, () => {
        setIsPlaying(false);
        setActiveIndex(null);
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (!accessToken || accessToken === "null") {
      toast.error("🔒 You must be logged in to perform this action.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/emails/mark-read?all=true", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      res.ok
        ? toast.success("✅ All emails marked as read.")
        : toast.error("❌ Failed to mark emails as read.");
    } catch (error) {
      console.error("❌ Error marking as read:", error);
      toast.error("⚠️ Network error while marking emails.");
    }
  };

  const handleDeleteUnread = async () => {
    if (!accessToken || accessToken === "null") {
      toast.error("🔒 You must be logged in to perform this action.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/emails/unread?delete=true", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      res.ok
        ? toast.success("🗑️ Unread emails deleted.")
        : toast.error("❌ Failed to delete unread emails.");
    } catch (error) {
      console.error("❌ Error deleting unread emails:", error);
      toast.error("⚠️ Network error while deleting.");
    }
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p className="text-lg">📭 No emails matched your filters.</p>
        <p className="text-sm text-gray-400">Try adjusting your date or sender filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 max-h-[560px] overflow-y-auto">
      {senderGroups.map(({ sender, emails: senderEmails }) => (
        <div key={sender} className="mb-6">
          <SenderCard
            sender={sender}
            onReadAloud={() => readSenderEmails(senderEmails)}
            onFetchEmails={() => expandSenderEmails(sender)}
          />

          {expandedSender === sender && (
            <ul className="space-y-2 pl-4 border-l-2 border-gray-200 mt-2">
              {senderEmails.map((email, index) => (
                <li
                  key={email.id || index}
                  className="border-b pb-2 hover:bg-gray-50 transition-all rounded px-2 py-1 flex justify-between items-start"
                >
                  <div className="flex-grow pr-4">
                    <p className="font-semibold text-indigo-700 text-sm truncate">
                      {email.subject || <em className="text-gray-400">No subject</em>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {email.snippet || "No preview available."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePlay(email, index)}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    title={activeIndex === index && isPlaying ? "Pause" : "Read Aloud"}
                  >
                    {activeIndex === index && isPlaying ? (
                      <PauseCircle size={24} />
                    ) : (
                      <PlayCircle size={24} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* ✅ Bulk Controls */}
      <div className="flex justify-end mt-5 space-x-4 text-sm">
        <button
          onClick={handleMarkAllRead}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition"
        >
          ✅ Mark All Read
        </button>
        <button
          onClick={handleDeleteUnread}
          className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition"
        >
          🗑️ Delete Unread
        </button>
      </div>
    </div>
  );
}

export default EmailList;
