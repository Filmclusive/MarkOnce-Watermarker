import { APP_VERSION } from "../../constants/app";
import type { ExportFormat, ExportRecord } from "../../types/exportRecord";
import type { LocalWatermarkerProject } from "../../types/project";

export function createExportRecord(input: {
  project: LocalWatermarkerProject;
  format: ExportFormat;
  exportPath: string;
  exportFileName: string;
  exportFileHash: string;
  watermarkSettingsHash: string;
  notes?: string;
}): ExportRecord {
  return {
    exportId: crypto.randomUUID(),
    projectId: input.project.projectId,
    createdAt: new Date().toISOString(),
    recipient: input.project.watermarkSettings.recipient,
    purpose: input.project.watermarkSettings.purpose,
    date: input.project.watermarkSettings.date,
    watermarkText: input.project.watermarkSettings.resolvedText,
    format: input.format,
    exportPath: input.exportPath,
    exportFileName: input.exportFileName,
    sourceFileHash: input.project.sourceFileHash,
    exportFileHash: input.exportFileHash,
    watermarkSettingsHash: input.watermarkSettingsHash,
    appVersion: APP_VERSION,
    notes: input.notes ?? ""
  };
}
