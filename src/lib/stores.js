import { writable } from "svelte/store";

export const serverInfo = writable({
  location: "Unknown",
  time: "...",
  adminStatus: "unknown", // "online", "offline", "unknown", "error", "unavailable"
});
