// Human-readable date/time formatting — "Sat, Aug 21, 2026" / "5:42 PM".
// Mono/tabular-nums is reserved for tx hashes and ticket codes, not these.

export function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return null;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${period}`;
}

export function formatDateTime(dateStr, timeStr) {
  const date = formatDate(dateStr);
  const time = formatTime(timeStr);
  return time ? `${date} · ${time}` : date;
}
