// frontend/src/utils/ai.js

export async function summarizeEmails({ email, messageIds }) {
  const res = await fetch("http://localhost:8000/api/ai/summarize-emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      message_ids: messageIds,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to summarize emails.");
  }

  const data = await res.json();
  return data.summary;
}
