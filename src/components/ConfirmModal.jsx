// ✅ ConfirmModal.jsx — AI-Polished Modal with Animations + Accessibility
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "red", // or "blue", "green"
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  const colorMap = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-96 max-w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              {title || "Confirm Action"}
            </h2>
            <p className="text-gray-600 mb-6">
              {message || "Are you sure you want to proceed?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`text-white px-4 py-2 rounded-lg transition ${colorMap[confirmColor]}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
