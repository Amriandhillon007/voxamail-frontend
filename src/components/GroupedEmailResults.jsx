// ✅ GroupedEmailResults.jsx – Enhanced Grouped Display for AI Summary Emails
import React, { useState } from "react";
import { Volume2, Reply, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function GroupedEmailResults({ groups, accessToken, userEmail, onRelayCommand }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (sender) => {
    setExpanded((prev) => ({ ...prev, [sender]: !prev[sender] }));
  };

  const speak = (text) => {
    if (onRelayCommand) {
      onRelayCommand("speak", { content: text });
    }
  };

  const suggestReply = (messageId) => {
    if (onRelayCommand) {
      onRelayCommand("suggest_reply", { messageId });
    }
  };

  return (
    <div className="mt-5">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="mb-4 border border-gray-200 rounded-xl bg-white shadow-sm"
        >
          {/* Sender Heading */}
          <div
            onClick={() => toggleExpand(group.sender)}
            className="cursor-pointer px-4 py-3 bg-gray-100 rounded-t-xl flex justify-between items-center"
          >
            <h4 className="text-sm font-semibold text-gray-800">
              {group.sender}
            </h4>
            {expanded[group.sender] ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {/* Emails in group */}
          {expanded[group.sender] && (
            <div className="p-4 space-y-3">
              {group.emails.map((email, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                >
                  <h5 className="text-sm font-semibold text-gray-700">
                    {email.subject || "No subject"}
                  </h5>
                  <p className="text-xs text-gray-500 mb-2">{email.snippet}</p>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                      onClick={() => speak(email.snippet)}
                    >
                      <Volume2 size={14} />
                    </button>
                    <button
                      className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      onClick={() => suggestReply(email.id)}
                    >
                      <Reply size={14} className="inline-block mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
