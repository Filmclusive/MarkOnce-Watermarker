export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function requireTauriRuntime() {
  if (!isTauriRuntime()) {
    throw new Error("Run the desktop app to use native file actions.");
  }
}
