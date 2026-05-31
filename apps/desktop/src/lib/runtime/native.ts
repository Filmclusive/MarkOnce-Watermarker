import { invoke } from "@tauri-apps/api/core";
import { requireTauriRuntime } from "./tauri";

export function openNativePath(path: string) {
  requireTauriRuntime();
  return invoke<void>("open_path", { path });
}

export function showNativePathInFolder(path: string) {
  requireTauriRuntime();
  return invoke<void>("show_in_folder", { path });
}

export function doesFileExist(path: string) {
  if (typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window)) return Promise.resolve(false);
  return invoke<boolean>("file_exists", { path });
}
