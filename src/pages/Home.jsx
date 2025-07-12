// ✅ FINALIZED + WIRED Home.jsx (Relay Commands + AI Integration)
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import SummaryCard from "../components/SummaryCard";
import SenderCard from "../components/SenderCard";
import SmartSearchBar from "../components/SmartSearchBar";
import VoxaAIPanel from "../components/VoxaAIPanel";
import ComposePanel from "../components/ComposePanel";
import VoxaSuggestionsPanelFloating from "../components/VoxaSuggestionsPanelFloating";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

const Home = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [error, setError] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [groupedSenders, setGroupedSenders] = useState([]);
  const [filteredSender, setFilteredSender] = useState(null);
  const [zenMode, setZenMode] = useState(false);
  const [previousGrouped, setPreviousGrouped] = useState([]);
  const scrollRef = useRef();
  const [draftReply, setDraftReply] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const userEmail = localStorage.getItem("email");

    if (token && userEmail && token !== "null" && userEmail !== "null") {
      setAccessToken(token);
      setRefreshToken(refresh);
      setEmail(userEmail);
      loadInboxWithTokens(userEmail, token, refresh);
    } else {
      toast.error("🔒 Session expired. Redirecting...");
      navigate("/intro");
    }
  }, [navigate]);

  const loadInboxWithTokens = async (email, accessToken, refreshToken) => {
    setLoading(true);
    setError("");
    setLoadingMessage("📬 Fetching your full inbox...");
    try {
      const res = await fetch(`http://localhost:8000/emails/all?email=${email}`);
      if (!res.ok) throw new Error("Inbox fetch failed");
      const data = await res.json();
      setGroupedSenders(data.senders || []);
      setPreviousGrouped(data.senders || []);
    } catch (err) {
      console.error("❌ Inbox fetch error:", err);
      toast.error("⚠️ Could not fetch inbox.");
      setError("📭 Failed to load inbox.");
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearch = async ({ senders = [], after, before }) => {
    if (!senders.length) return toast.error("Please enter at least one sender.");
    setLoading(true);
    setLoadingMessage("🔎 Searching across multiple senders...");
    try {
      const results = [];
      for (const sender of senders) {
        let url = `http://localhost:8000/emails/by-sender?email=${email}&sender=${encodeURIComponent(sender)}`;
        if (after) url += `&after=${after}`;
        if (before) url += `&before=${before}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const combined = [...(data.last_week || []), ...(data.last_month || []), ...(data.older || [])];
        results.push({ sender, emails: combined });
      }
      if (results.length === 0) toast.error("No results found.");
      if (results.length === 1) {
        setFilteredSender(results[0]);
      } else {
        setPreviousGrouped(groupedSenders);
        setGroupedSenders(results);
        setFilteredSender(null);
      }
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Smart Search error:", err);
      toast.error("Failed to fetch emails.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilteredSender = () => {
    setGroupedSenders(previousGrouped);
    setFilteredSender(null);
    setSummaryResult("");
  };

  const relayCommand = async (type, payload) => {
    switch (type) {
      case "fetch_emails_from_sender":
        if (!payload.sender) return;
        setLoading(true);
        setLoadingMessage(`Fetching emails from ${payload.sender}...`);
        try {
          const res = await fetch(
            `http://localhost:8000/emails/by-sender?email=${email}&sender=${encodeURIComponent(payload.sender)}`
          );
          const data = await res.json();
          const combined = [...(data.last_week || []), ...(data.last_month || []), ...(data.older || [])];
          setFilteredSender({ sender: payload.sender, emails: combined });
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          console.error("Failed to fetch sender emails:", err);
          toast.error("❌ Could not fetch emails.");
        } finally {
          setLoading(false);
        }
        break;

      case "mark_emails_read":
        if (!payload.threadIds || payload.threadIds.length === 0) return;
        try {
          const res = await fetch("http://localhost:8000/emails/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: accessToken,
              thread_ids: payload.threadIds,
            }),
          });
          const data = await res.json();
          toast.success(`✅ Marked ${data.updated || 0} emails as read`);
          loadInboxWithTokens(email, accessToken, refreshToken);
        } catch (err) {
          console.error("❌ Failed to mark as read", err);
          toast.error("Failed to mark emails as read.");
        }
        break;

      case "send_to_compose":
        if (!payload.reply) return;
        toast.success("✉️ Reply sent to Compose Panel");
        setDraftReply(payload.reply);
        break;

      default:
        console.warn("Unknown relay command:", type);
    }
  };

  useEffect(() => {
    document.body.style.overflow = zenMode ? "hidden" : "auto";
  }, [zenMode]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#eef2f7] to-[#f9fafe]">
      <Navbar
        onLogout={() => {
          localStorage.clear();
          navigate("/intro");
        }}
      />
      <Toaster position="top-right" />
      <main className="p-4 sm:p-6 max-w-[100vw] mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700">📥 VoxaMail: AI Inbox</h1>
          <p className="text-sm text-gray-500">Summarized. Prioritized. Humanized.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 shadow">
            {error}
            <button
              onClick={() => loadInboxWithTokens(email, accessToken, refreshToken)}
              className="ml-4 text-sm font-medium underline"
            >
              🔄 Retry
            </button>
          </div>
        )}

        <SummaryCard summary={summaryResult} onClear={() => setSummaryResult("")} />

        <PanelGroup
          direction="horizontal"
          className="rounded-xl border"
          style={{ height: "calc(100vh - 220px)", overflow: "hidden" }}
        >
          {/* Left Panel */}
          <Panel defaultSize={30} minSize={20}>
            <div className="flex flex-col h-full">
              <SmartSearchBar onSearch={handleSmartSearch} />
              <div className="px-2 py-1 text-sm text-gray-600 flex justify-between">
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className="underline text-indigo-600 hover:text-indigo-800"
                >
                  {zenMode ? "🔽 Collapse All" : "🧘 Expand All"}
                </button>
                {(filteredSender || (previousGrouped.length > 0 && groupedSenders !== previousGrouped)) && (
                  <button
                    onClick={clearFilteredSender}
                    className="text-xs text-blue-500 underline"
                  >
                    🔙 Back to Inbox
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-2 relative" ref={scrollRef}>
                {loading && !filteredSender && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <Spinner message={loadingMessage} />
                  </div>
                )}
                {!loading && filteredSender ? (
                  <SenderCard
                    sender={filteredSender.sender}
                    userEmail={email}
                    accessToken={accessToken}
                    emails={filteredSender.emails}
                    onRefresh={() => loadInboxWithTokens(email, accessToken, refreshToken)}
                    zenMode={zenMode}
                  />
                ) : (
                  groupedSenders
                    .sort((a, b) => {
                      const pinned = JSON.parse(localStorage.getItem("pinned_senders") || "[]");
                      return pinned.includes(b.sender) - pinned.includes(a.sender);
                    })
                    .map((group, idx) => (
                      <SenderCard
                        key={idx}
                        sender={group.sender}
                        userEmail={email}
                        accessToken={accessToken}
                        onRefresh={() => loadInboxWithTokens(email, accessToken, refreshToken)}
                        onSummaryGenerated={setSummaryResult}
                        zenMode={zenMode}
                        enableMood
                        enableUrgency
                        enableDensity
                      />
                    ))
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-indigo-400 cursor-col-resize" />

          {/* Middle Panel */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full px-4 overflow-hidden">
              {accessToken ? (
                <VoxaAIPanel
                  accessToken={accessToken}
                  userEmail={email}
                  onReplyGenerated={setDraftReply}
                  onRelayCommand={relayCommand} // ✅ New
                  features={{
                    enableInboxDNA: true,
                    enablePriorityRanker: true,
                    enableMoodClustering: true,
                  }}
                />
              ) : (
                <div className="text-center text-gray-400 mt-12">
                  🔒 Login to use Voxa AI Assistant
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-indigo-400 cursor-col-resize" />

          {/* Right Panel */}
          <Panel defaultSize={20} minSize={20}>
            <div className="h-full px-4 flex flex-col space-y-4 overflow-hidden">
              <div className="bg-white shadow-xl rounded-2xl p-6 flex-1">
                {accessToken ? (
                  <ComposePanel
                    userEmail={email}
                    accessToken={accessToken}
                    injectedReply={draftReply}
                  />
                ) : (
                  <div className="text-center text-gray-400">🔒 Login to compose</div>
                )}
              </div>

              <div className="bg-white shadow-xl rounded-2xl p-6 flex-1">
                <VoxaSuggestionsPanelFloating email={email} />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
};

export default Home;
