// 📦 VoxaMail API Utility
const BASE_URL = "http://localhost:8000"; // Change to live URL in production

// 📬 Fetch full inbox with optional filters
export async function getInbox(email, options = {}) {
  const params = new URLSearchParams({ email });

  if (options.sender) params.append("sender", options.sender);
  if (options.keyword) params.append("keyword", options.keyword);
  if (options.after) params.append("after", options.after);
  if (options.before) params.append("before", options.before);

  const res = await fetch(`${BASE_URL}/emails?${params.toString()}`);
  if (!res.ok) throw new Error("❌ Failed to fetch inbox");
  return res.json();
}

// 📬 Fetch unread filtered emails (used for filters + bulk)
export async function getUnreadFiltered({ accessToken, refreshToken, sender, after, before }) {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sender) params.append("sender", sender);
  if (after) params.append("after", after);
  if (before) params.append("before", before);

  const res = await fetch(`${BASE_URL}/emails/unread?${params.toString()}`);
  if (!res.ok) throw new Error("❌ Failed to fetch unread emails");
  return res.json();
}

// ✅ AI Command → Parse → Execute
export async function executeAICommand(accessToken, message) {
  const parsedRes = await fetch(`${BASE_URL}/execute-command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const parsed = await parsedRes.json();

  if (!parsed || parsed.error) {
    return { parsed };
  }

  const execRes = await fetch(`${BASE_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, command: parsed.parsed }),
  });

  const execution = await execRes.json();
  return { parsed: parsed.parsed, execution };
}

// ✅ Mark emails as read (batch)
export async function markAsRead(email, messageIds) {
  const res = await fetch(`${BASE_URL}/emails/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message_ids: messageIds }),
  });

  if (!res.ok) throw new Error("❌ Failed to mark emails as read");
  return res.json();
}

// 🗑️ Delete emails (if supported)
export async function deleteEmails(email, messageIds) {
  const res = await fetch(`${BASE_URL}/emails/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message_ids: messageIds }),
  });

  if (!res.ok) throw new Error("❌ Failed to delete emails");
  return res.json();
}

// ✉️ Send email to multiple recipients
export async function sendEmail({ email, to, subject, body }) {
  const res = await fetch(`${BASE_URL}/emails/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, to, subject, body }),
  });

  if (!res.ok) throw new Error("❌ Failed to send email");
  return res.json();
}

// 🤖 AI Summarizer for email snippets
export async function summarizeEmails({ accessToken, refreshToken, sender, after, before }) {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, sender, after, before }),
  });

  if (!res.ok) throw new Error("❌ Failed to summarize emails");
  return res.json();
}

// 🔐 Logout + local cleanup
export function logoutUser(email) {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("email");
  console.log(`🔒 Logged out: ${email}`);
}
