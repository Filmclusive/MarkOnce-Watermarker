import type { ExportFormat } from "../../types/exportRecord";
import type { LocalWatermarkerProject } from "../../types/project";

export function sanitizeFilenamePart(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/[/\\:*?"<>|]/g, "")
    .replaceAll(/[^a-z0-9._ -]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^[.-]+|[.-]+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
}

export function buildExportFilename(project: LocalWatermarkerProject, format: ExportFormat) {
  const stem = project.sourceFileName.replace(/\.[^.]+$/, "");
  const parts = [
    sanitizeFilenamePart(stem, "document"),
    sanitizeFilenamePart(project.watermarkSettings.recipient, "recipient"),
    sanitizeFilenamePart(project.watermarkSettings.purpose, "purpose"),
    sanitizeFilenamePart(project.watermarkSettings.date, new Date().toISOString().slice(0, 10)),
    "watermarked"
  ];

  return `${parts.join("_")}.${format}`;
}
