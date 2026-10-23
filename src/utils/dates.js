// Queue date in Indian Standard Time as "YYYY-MM-DD" (a new queue starts every day).
export function todayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Firestore Timestamp -> milliseconds (null while the server time is still pending).
export function toMillis(ts) {
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}

export function formatTime(ts) {
  const ms = toMillis(ts);
  if (!ms) return "—";
  return new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function minutesSince(ts) {
  const ms = toMillis(ts);
  return ms ? Math.max(0, Math.round((Date.now() - ms) / 60000)) : 0;
}
