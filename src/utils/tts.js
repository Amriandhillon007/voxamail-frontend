// frontend/src/utils/tts.js – ✅ Coqui TTS Utility (Phase 6.5 Bulletproof)

let activeAudio = null;
let isSpeaking = false;
let activeBlobUrl = null;

export function isCurrentlySpeaking() {
  return isSpeaking;
}

export async function speakText(text, voiceId = "coqui-default", onComplete = () => {}) {
  if (!text || text.trim().length < 10) {
    console.warn("🟡 Skipping short or empty text.");
    onComplete();
    return;
  }

  try {
    // Cleanup before playing
    stopReading();

    const res = await fetch("http://localhost:8000/api/tts-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Coqui TTS response error:", errorText);
      isSpeaking = false;
      onComplete();
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    activeBlobUrl = url;

    const audio = new Audio(url);
    audio.preload = "auto";

    audio.onended = () => {
      isSpeaking = false;
      cleanupAudio();
      onComplete();
    };

    audio.onerror = (err) => {
      console.error("🔊 Audio playback error:", err);
      isSpeaking = false;
      cleanupAudio();
      onComplete();
    };

    isSpeaking = true;
    activeAudio = audio;
    audio.play();
  } catch (err) {
    console.error("❌ Coqui TTS fetch error:", err);
    isSpeaking = false;
    cleanupAudio();
    onComplete();
  }
}

export async function readEmailAloud(email, voiceId = "coqui-default", onComplete = () => {}) {
  if (!email) return;

  const cleanedText = extractMainContent(email);
  const text = `
    From: ${email.sender || "Unknown sender"}.
    Subject: ${email.subject || "No subject"}.
    Message: ${cleanedText}.
  `.trim();

  return speakText(text, voiceId, onComplete);
}

export function stopReading() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    cleanupAudio();
  }
  isSpeaking = false;
}

function cleanupAudio() {
  if (activeAudio) {
    activeAudio = null;
  }
  if (activeBlobUrl) {
    URL.revokeObjectURL(activeBlobUrl);
    activeBlobUrl = null;
  }
}

// ✨ Content simplifier for voice readability
function extractMainContent(email) {
  const raw = email.full_text || email.body || email.snippet || "No content.";
  const cleaned = raw
    .replace(/https?:\/\/\S+/g, "a link")             // Skip URLs
    .replace(/\b\d{6,}\b/g, "some numbers")            // Replace long number strings
    .replace(/[\r\n]+/g, " ")                          // Flatten newlines
    .replace(/\s+/g, " ")                              // Normalize spacing
    .trim()
    .slice(0, 800);                                    // Limit for clarity

  return cleaned;
}

export function getVoiceOptions() {
  return [
    { value: "coqui-default", label: "Default Voice (Coqui)" },
    // Add more voices here as needed
  ];
}

export function getVoiceName(voiceId) {
  const voice = getVoiceOptions().find((v) => v.value === voiceId);
  return voice ? voice.label : "Unknown Voice";
}
