import React, { useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";
import { useSenderQuota } from "../hooks/useSenderQuota";

const BulkSender = ({ accessToken, filterForm, onRefresh }) => {
  const sender = filterForm.sender || "Unknown Sender";
  const [isModalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [loading, setLoading] = useState(false);

  const quota = useSenderQuota(sender);

  const handleBulkAction = async (type) => {
    if (!accessToken || accessToken === "null") {
      toast.error("❌ Missing token. Please log in again.");
      return;
    }

    if (!quota.canProceed()) {
      toast.error(
        `🚫 Daily limit reached for ${sender}. Max ${quota.maxPerSender} bulk actions per day.`
      );
      return;
    }

    setLoading(true);
    try {
      const command = {
        action: type,
        ...filterForm,
        filter: "unread",
      };

      const res = await axios.post("http://localhost:8000/execute", {
        access_token: accessToken,
        command,
      });

      if (res.data?.status === "success") {
        toast.success(`✅ Emails ${type === "delete" ? "deleted" : "marked as read"}`);
        quota.recordUsage();
        onRefresh?.();
      } else {
        toast.error("❌ Action failed. Try again.");
        console.warn("⚠️ Backend response:", res.data);
      }
    } catch (err) {
      console.error("🔥 API Error:", err);
      toast.error("❌ Could not complete action.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setActionType(type);
    setModalOpen(true);
  };

  const confirmAction = () => {
    setModalOpen(false);
    if (actionType) handleBulkAction(actionType);
  };

  return (
    <div className="mt-4 flex gap-3 flex-wrap items-center">
      <button
        onClick={() => openModal("mark_as_read")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        disabled={loading || !quota.canProceed()}
      >
        📩 Mark as Read (sender)
      </button>

      <button
        onClick={() => openModal("delete")}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        disabled={loading || !quota.canProceed()}
      >
        🗑️ Delete Emails (sender)
      </button>

      <span className="text-sm text-gray-500">
        {quota.remaining} action{quota.remaining !== 1 ? "s" : ""} left today for this sender
      </span>

      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmAction}
        onCancel={() => setModalOpen(false)}
        title="Confirm Bulk Action"
        message={
          actionType === "delete"
            ? "Are you sure you want to delete all filtered emails from this sender?"
            : "Are you sure you want to mark all filtered emails from this sender as read?"
        }
      />
    </div>
  );
};

export default BulkSender;
