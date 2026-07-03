/** "2 minutes ago" style formatting for ISO timestamps. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Map a backend status string to a display label + tone. */
export function statusMeta(status: string): { label: string; tone: "success" | "warning" | "neutral" } {
  const s = status.toLowerCase();
  if (s === "ready" || s === "synced" || s === "active") return { label: "Ready", tone: "success" };
  if (s === "indexing" || s === "syncing" || s === "pending" || s === "registered")
    return { label: capitalize(s), tone: "warning" };
  if (s === "error" || s === "failed") return { label: capitalize(s), tone: "warning" };
  return { label: capitalize(s || "Unknown"), tone: "neutral" };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
