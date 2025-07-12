// 📦 VoxaMail API Utility
const BASE_URL = "http://localhost:8000"; // Change in prod

// 📬 Full inbox (optionally filtered)
export async function getInbox(email, options = {}) {
  const params = new URLSearchParams({ email });
  if (options.sender) params.append("sender", options.sender);
  if (options.keyword) params.append("keyword", options.keyword);
  if (options.after) params.append("after", options.after);
  if (options.before) params.append("before", options.before);

  const res = await fetch(`${BASE_URL}/emails?${params}`);
  if (!res.ok) throw new Error("❌ Failed to fetch inbox");
  return res.json();
}

// 📬 Fetch unread emails (with filters)
export async function getUnreadFiltered({ accessToken, refreshToken, sender, after, before }) {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sender) params.append("sender", sender);
  if (after) params.append("after", after);
  if (before) params.append("before", before);

  const res = await fetch(`${BASE_URL}/emails/unread?${params}`);
  if (!res.ok) throw new Error("❌ Failed to fetch unread emails");
  return res.json();
}

// ✅ AI command parser + executor
export async function executeAICommand(accessToken, message) {
  const parsedRes = await fetch(`${BASE_URL}/execute-command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const parsed = await parsedRes.json();
  if (!parsed || parsed.error) return { parsed };

  const execRes = await fetch(`${BASE_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, command: parsed.parsed }),
  });

  const execution = await execRes.json();
  return { parsed: parsed.parsed, execution };
}

// ✅ Batch mark read
export async function markAsRead(email, messageIds) {
  const res = await fetch(`${BASE_URL}/emails/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message_ids: messageIds }),
  });
  if (!res.ok) throw new Error("❌ Failed to mark emails as read");
  return res.json();
}

// 🗑️ Batch delete
export async function deleteEmails(email, messageIds) {
  const res = await fetch(`${BASE_URL}/emails/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message_ids: messageIds }),
  });
  if (!res.ok) throw new Error("❌ Failed to delete emails");
  return res.json();
}

// 📧 Send email
export async function sendEmail({ email, to, subject, body }) {
  const res = await fetch(`${BASE_URL}/emails/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, to, subject, body }),
  });
  if (!res.ok) throw new Error("❌ Failed to send email");
  return res.json();
}

// 🧠 AI summarizer (general)
export async function summarizeEmails({ email, sender, after, before }) {
  const res = await fetch(`${BASE_URL}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sender, after, before }),
  });
  if (!res.ok) throw new Error("❌ Failed to summarize emails");
  return res.json();
}

// 🧠 AI summarizer (by sender)
export async function summarizeEmailsBySender({ email, sender }) {
  const res = await fetch(`${BASE_URL}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sender }),
  });
  if (!res.ok) throw new Error(`❌ Failed to summarize ${sender}`);
  return res.json();
}

// 📊 Get unread senders (Phase 6.5)
export async function getUnreadSenders({ accessToken, refreshToken }) {
  const res = await fetch(`${BASE_URL}/emails/unread-senders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error("❌ Failed to fetch unread senders");
  return res.json();
}

// 🧼 Delete by sender (Phase 6.5)
export async function deleteEmailsBySender({ email, sender }) {
  const res = await fetch(`${BASE_URL}/emails/delete-by-sender`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sender }),
  });
  if (!res.ok) throw new Error(`❌ Failed to delete emails from ${sender}`);
  return res.json();
}

// 🚫 Enforce quota (Phase 6.5)
export async function enforceSenderQuota(sender, actionType) {
  const key = `quota-${sender}-${actionType}`;
  const record = JSON.parse(localStorage.getItem(key)) || { count: 0, date: new Date().toISOString() };

  const now = new Date();
  const last = new Date(record.date);
  const sameDay = now.toDateString() === last.toDateString();

  const limit = 3;
  if (sameDay && record.count >= limit) {
    return false;
  }

  localStorage.setItem(
    key,
    JSON.stringify({
      count: sameDay ? record.count + 1 : 1,
      date: now.toISOString(),
    })
  );

  return true;
}

// 🔐 Logout cleanup
export function logoutUser(email) {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("email");
  console.log(`🔒 Logged out: ${email}`);
}
