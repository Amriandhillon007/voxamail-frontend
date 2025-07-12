// 📦 VoxaMail – BulkActions.jsx (Phase 6.6.2 Upgrade)
import React, { useState } from "react";
import toast from "react-hot-toast";
import { markAsRead, deleteEmails, summarizeEmails } from "../utils/api";
import SummaryModal from "./SummaryModal";
import { useSenderQuota } from "../hooks/useSenderQuota";

// ✅ Reusable button component
const ActionButton = ({ icon, label, onClick, color }) => {
  const colorMap = {
    green: "from-green-400 to-green-500",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-white bg-gradient-to-r ${colorMap[color]} px-4 py-2 rounded-full shadow-md hover:scale-105 transition-all text-sm`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const BulkActions = ({
  accessToken,
  filterForm,
  onExecute,
  filteredCount,
  unreadCount,
  onSummaryGenerated,
}) => {
  const email = localStorage.getItem("email");
  const [summary, setSummary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canRunAction, recordAction, remaining } = useSenderQuota(filterForm.sender, 3);

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

  const withQuotaCheck = async (actionName, handler) => {
    if (!canRunAction()) {
      toast.error(`🚫 Daily quota of 3 ${actionName} actions reached for this sender.`);
      return;
    }

    await handler();
    recordAction();
  };

  const handleMarkAllRead = () =>
    withQuotaCheck("mark-as-read", async () => {
      if (!email || !accessToken) return toast.error("Missing session info.");
      toast.loading("Marking emails as read...");
      const ids = await fetchUnreadMessageIds();
      if (ids.length === 0) return toast("No unread emails matched.");
      await markAsRead(email, ids.slice(0, 20));
      toast.dismiss();
      toast.success("✅ Emails marked as read.");
      onExecute?.("mark_as_read");
    });

  const handleDeleteFiltered = () =>
    withQuotaCheck("delete", async () => {
      if (!email || !accessToken) return toast.error("Missing session info.");
      toast.loading("Deleting emails...");
      const ids = await fetchUnreadMessageIds();
      if (ids.length === 0) return toast("No emails matched.");
      await deleteEmails(email, ids.slice(0, 20));
      toast.dismiss();
      toast.success("🗑️ Emails deleted.");
      onExecute?.("delete");
    });

  const handleSummarize = () =>
    withQuotaCheck("summarize", async () => {
      if (!email || !accessToken) return toast.error("Missing session info.");
      try {
        toast.loading("Summarizing emails with AI...");
        const ids = await fetchUnreadMessageIds();
        if (ids.length === 0) return toast("No emails to summarize.");
        const result = await summarizeEmails({ email, messageIds: ids.slice(0, 20) });
        setSummary(result.summary || "No summary returned.");
        setIsModalOpen(true);
        toast.dismiss();
        if (onSummaryGenerated) onSummaryGenerated(result.summary || "No summary returned.");
        toast.success("✅ Emails summarized.");
      } catch (err) {
        toast.dismiss();
        toast.error("❌ Failed to summarize.");
      }
    });

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl px-4 py-3 shadow-sm mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <ActionButton
          icon="✅"
          label={`Mark Read (${Math.min(filteredCount, 20)})`}
          onClick={handleMarkAllRead}
          color="green"
        />
        <ActionButton
          icon="🗑️"
          label={`Delete (${Math.min(filteredCount, 20)})`}
          onClick={handleDeleteFiltered}
          color="red"
        />
        <ActionButton
          icon="🧠"
          label={`Summarize (${Math.min(filteredCount, 20)})`}
          onClick={handleSummarize}
          color="indigo"
        />
      </div>

      <div className="text-sm text-gray-600 flex flex-col md:flex-row gap-2 items-end md:items-center ml-auto">
        {filterForm.sender && (
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
            📤 Sender: {filterForm.sender}
          </span>
        )}
        <span>
          📅 Daily Quota Left:{" "}
          <span className="font-semibold text-red-600">{remaining} / 3</span>
        </span>
        <span>
          ✉️ Total Unread:{" "}
          <span className="font-semibold text-indigo-700">{unreadCount}</span>
        </span>
      </div>

      {isModalOpen && (
        <SummaryModal summary={summary} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default BulkActions;
