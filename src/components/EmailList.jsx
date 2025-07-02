import React from "react";
import toast from "react-hot-toast";

const EmailList = ({ emails }) => {
  const accessToken = localStorage.getItem("access_token");

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
      if (res.ok) {
        toast.success("✅ All emails marked as read.");
      } else {
        toast.error("❌ Failed to mark emails as read.");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
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
      if (res.ok) {
        toast.success("🗑️ Unread emails deleted.");
      } else {
        toast.error("❌ Failed to delete unread emails.");
      }
    } catch (error) {
      console.error("Error deleting unread emails:", error);
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
    <div className="bg-white rounded-lg shadow p-4 max-h-[400px] overflow-y-auto">
      <ul className="space-y-3">
        {emails.map((email, index) => (
          <li
            key={index}
            className="border-b pb-2 hover:bg-gray-100 transition-all rounded p-2"
          >
            <p className="font-medium text-indigo-700 truncate">
              {email.subject || <em className="text-gray-400">No subject</em>}
            </p>
            <p className="text-sm text-gray-600">
              From: {email.sender || "Unknown sender"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailList;
