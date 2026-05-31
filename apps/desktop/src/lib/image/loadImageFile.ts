import { invoke } from "@tauri-apps/api/core";
import { requireTauriRuntime } from "../runtime/tauri";

export async function readImageDataUrl(path: string) {
  requireTauriRuntime();
  return invoke<string>("read_image_data_url", { path });
}

export function loadImageFromDataUrl(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = dataUrl;
  });
}
