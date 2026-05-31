export type ExportFormat = "pdf" | "png" | "jpg";

export interface ExportRecord {
  exportId: string;
  projectId: string;
  createdAt: string;
  recipient: string;
  purpose: string;
  date: string;
  watermarkText: string;
  format: ExportFormat;
  exportPath: string;
  exportFileName: string;
  sourceFileHash: string;
  exportFileHash: string;
  watermarkSettingsHash: string;
  appVersion: string;
  notes: string;
}
