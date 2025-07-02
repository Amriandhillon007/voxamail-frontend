import React, { useState, useEffect } from "react";
import EmailList from "../components/EmailList";
import BulkActions from "../components/BulkActions";
import ChatBox from "../components/ChatBox";
import VoiceButton from "../components/VoiceButton";
import Spinner from "../components/Spinner";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

import {
  getInbox,
  getUnreadFiltered,
  sendEmail,
  markAsRead,
  deleteEmails,
  logoutUser,
} from "../utils/api";

const Home = () => {
  const [emails, setEmails] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [filterForm, setFilterForm] = useState({ sender: "", after: "", before: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ On mount: Load tokens and guard session
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const userEmail = localStorage.getItem("email");

    console.log("📦 Loaded from localStorage:", { token, refresh, userEmail });

    if (token && refresh && userEmail && token !== "null" && refresh !== "null") {
      setAccessToken(token);
      setRefreshToken(refresh);
      setEmail(userEmail);
      loadInbox(userEmail);
    } else {
      toast.error("🔒 Session expired. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    }
  }, []);

  // ✅ Fetch inbox emails
  const loadInbox = async (email) => {
    setLoading(true);
    setError("");
    try {
      const data = await getInbox(email);
      setEmails(data.emails || []);
    } catch (err) {
      toast.error("⚠️ Failed to load inbox.");
      setError("Could not load inbox.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch unread + filtered
  const fetchFilteredEmails = async (sender, after, before) => {
    setLoading(true);
    setError("");

    if (!accessToken || !refreshToken) {
      toast.error("🔒 Missing tokens. Please log in again.");
      setError("Missing access or refresh token.");
      setLoading(false);
      return;
    }

    try {
      const data = await getUnreadFiltered({
        accessToken,
        refreshToken,
        sender,
        after,
        before,
      });
      setEmails(data.emails || []);
    } catch (err) {
      toast.error("❌ Filter fetch failed.");
      setError("Could not fetch filtered emails.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Bulk action executor
  const handleBulkAction = async (actionType) => {
    if (!email || emails.length === 0) return toast("No emails to act on.");
    const ids = emails.map((e) => e.id);
    try {
      const result =
        actionType === "mark_as_read"
          ? await markAsRead(email, ids)
          : await deleteEmails(email, ids);

      if (result.status === "success") {
        toast.success(`${actionType.replace("_", " ")} successful.`);
        loadInbox(email);
      } else {
        toast.error("⚠️ Action failed.");
      }
    } catch {
      toast.error("❌ Network/API error.");
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const { sender, after, before } = filterForm;
    fetchFilteredEmails(sender, after, before);
  };

  const handleLogout = () => {
    logoutUser(email);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      <main className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Unread Emails</h1>
            <p className="text-sm text-gray-500">Filter and manage inbox with voice + AI</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            name="sender"
            placeholder="Sender (e.g. Amazon)"
            className="border px-3 py-2 rounded cursor-text"
            value={filterForm.sender}
            onChange={(e) => setFilterForm({ ...filterForm, sender: e.target.value })}
          />
          <input
            type="date"
            name="after"
            className="border px-3 py-2 rounded cursor-text"
            value={filterForm.after}
            onChange={(e) => setFilterForm({ ...filterForm, after: e.target.value })}
          />
          <input
            type="date"
            name="before"
            className="border px-3 py-2 rounded cursor-text"
            value={filterForm.before}
            onChange={(e) => setFilterForm({ ...filterForm, before: e.target.value })}
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
            Filter
          </button>
        </form>

        <BulkActions
          accessToken={accessToken}
          filterForm={filterForm}
          onExecute={handleBulkAction}
          filteredCount={emails.length}
          unreadCount={emails.filter((e) => e.snippet).length}
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {loading ? <Spinner /> : <EmailList emails={emails} />}

        <h2 className="text-2xl font-bold mt-8 mb-4">Ask Voxa AI</h2>
        {accessToken ? <ChatBox accessToken={accessToken} /> : <p>🔒 Login to use AI Assistant</p>}
      </main>

      <footer className="bg-white p-4 text-center text-sm text-gray-400">
        {emails.length > 0 ? <VoiceButton emails={emails} /> : "Loading voice tools..."}
      </footer>
    </div>
  );
};

export default Home;
