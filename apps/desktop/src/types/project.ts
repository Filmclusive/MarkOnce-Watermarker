import type { ExportRecord } from "./exportRecord";
import type { ImageAdjustments } from "./imageAdjustments";
import type { SafeZone, WatermarkSettings } from "./watermark";

export type SourceMode = "reference" | "copy";

export interface LocalWatermarkerProject {
  projectId: string;
  projectPath: string;
  projectName: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  sourceMode: SourceMode;
  sourceOriginalPath: string;
  sourceCopiedPath: string;
  sourceFileName: string;
  sourceFileType: string;
  sourceFileHash: string;
  sourceFileSize: number;
  sourceLastModifiedAt: string;
  imageAdjustments: ImageAdjustments;
  watermarkSettings: WatermarkSettings;
  safeZones: SafeZone[];
  exportHistory: ExportRecord[];
  appVersion: string;
}

export interface SourceFileInfo {
  fileName: string;
  fileType: string;
  fileHash: string;
  fileSize: number;
  lastModifiedAt: string;
}
