// 📦 VoxaMail - BulkActions.jsx
import React, { useState } from "react";
import { markAsRead, deleteEmails, summarizeEmails } from "../utils/api";
import toast from "react-hot-toast";
import SummaryModal from "./SummaryModal";

const BulkActions = ({ accessToken, filterForm, onExecute, filteredCount, unreadCount }) => {
  const email = localStorage.getItem("email");
  const [summary, setSummary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Reusable fetch logic for current filter
  const fetchUnreadMessageIds = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    const rawParams = {
      access_token: accessToken,
      refresh_token: refreshToken,
      sender: filterForm.sender,
      after: filterForm.after,
      before: filterForm.before,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(rawParams).filter(([_, v]) => v != null && v !== "")
    );

    const res = await fetch(
      `http://localhost:8000/emails/unread?` + new URLSearchParams(filteredParams)
    );
    const data = await res.json();
    return data.emails?.map((email) => email.id) || [];
  };

  // ✅ Mark as read action
  const handleMarkAllRead = async () => {
    if (!email || !accessToken) return toast.error("Missing session info.");
    try {
      toast.loading("Marking emails as read...");
      const ids = await fetchUnreadMessageIds();
      if (ids.length === 0) return toast("No unread emails matched.");
      await markAsRead(email, ids);
      toast.dismiss();
      toast.success("✅ Emails marked as read.");
      onExecute?.("mark_as_read");
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Failed to mark as read.");
    }
  };

  // ✅ Delete action
  const handleDeleteFiltered = async () => {
    if (!email || !accessToken) return toast.error("Missing session info.");
    try {
      toast.loading("Deleting filtered emails...");
      const ids = await fetchUnreadMessageIds();
      if (ids.length === 0) return toast("No emails matched.");
      await deleteEmails(email, ids);
      toast.dismiss();
      toast.success("🗑️ Emails deleted.");
      onExecute?.("delete");
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Failed to delete emails.");
    }
  };

  // ✅ Summarize action
  const handleSummarize = async () => {
    if (!email || !accessToken) return toast.error("Missing session info.");
    try {
      toast.loading("Summarizing emails with AI...");
      const ids = await fetchUnreadMessageIds();
      if (ids.length === 0) return toast("No emails to summarize.");
      const result = await summarizeEmails({ email, messageIds: ids });
      setSummary(result.summary || "No summary returned.");
      setModalOpen(true);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Failed to summarize emails.");
    }
  };

  return (
    <div className="flex gap-4 mb-4 flex-wrap">
      <button
        onClick={handleMarkAllRead}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        ✅ Mark Filtered as Read ({filteredCount})
      </button>

      <button
        onClick={handleDeleteFiltered}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        🗑️ Delete Filtered Emails ({filteredCount})
      </button>

      <button
        onClick={handleSummarize}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
      >
        🧠 Summarize ({filteredCount})
      </button>

      <span className="text-sm text-gray-500 ml-auto self-center">
        Total Unread: {unreadCount}
      </span>

      {/* 🧠 Summary Modal */}
      {modalOpen && (
        <SummaryModal summary={summary} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};

export default BulkActions;
