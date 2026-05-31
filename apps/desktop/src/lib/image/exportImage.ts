import { invoke } from "@tauri-apps/api/core";
import type { ExportFormat } from "../../types/exportRecord";

export interface WrittenExport {
  path: string;
  hash: string;
  size: number;
}

export async function canvasToDataUrl(canvas: HTMLCanvasElement, format: ExportFormat, quality: number) {
  if (format === "png") return canvas.toDataURL("image/png");
  if (format === "jpg") return canvas.toDataURL("image/jpeg", quality);
  throw new Error("Use PDF exporter for PDF output.");
}

export function writeExportFile(path: string, dataUrl: string) {
  return invoke<WrittenExport>("write_export_file", { path, dataUrl });
}

export function hashText(value: string) {
  const data = new TextEncoder().encode(value);
  return crypto.subtle.digest("SHA-256", data).then((digest) =>
    Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  );
}
