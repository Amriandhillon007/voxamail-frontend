// ✅ BulkSender.jsx – Final Private Beta Version (Filtered, Confirmed, Refreshed)
import React, { useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";

const BulkSender = ({ accessToken, filterForm, onRefresh }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (type) => {
    if (!accessToken) {
      toast.error("❌ Access token missing. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const command = {
        action: type === "delete" ? "delete" : "mark_as_read",
        ...filterForm,
        filter: "unread", // optional override
      };

      const response = await axios.post("http://localhost:8000/execute", {
        access_token: accessToken,
        command,
      });

      if (response.data?.status === "success") {
        toast.success(`✅ Emails ${type === "delete" ? "deleted" : "marked as read"}`);
        onRefresh?.(); // Refetch filtered emails
      } else {
        toast.error("❌ Action failed. Please try again.");
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("❌ Failed to perform bulk action.");
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
    <div className="mt-4 flex gap-3 flex-wrap">
      <button
        onClick={() => openModal("mark_as_read")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        disabled={loading}
      >
        📩 Mark Filtered as Read
      </button>

      <button
        onClick={() => openModal("delete")}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        disabled={loading}
      >
        🗑️ Delete Filtered Emails
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmAction}
        onCancel={() => setModalOpen(false)}
        title="Confirm Bulk Action"
        message={
          actionType === "delete"
            ? "Are you sure you want to delete all filtered emails?"
            : "Are you sure you want to mark all filtered emails as read?"
        }
      />
    </div>
  );
};

export default BulkSender;
