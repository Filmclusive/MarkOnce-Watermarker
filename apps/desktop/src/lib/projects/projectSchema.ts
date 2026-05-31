import { getDefaultProjectFields } from "./defaultProject";
import { withResolvedWatermark } from "../watermark/buildWatermarkText";
import type { LocalWatermarkerProject } from "../../types/project";

export function hydrateProject(project: LocalWatermarkerProject): LocalWatermarkerProject {
  const defaults = getDefaultProjectFields();
  return withResolvedWatermark({
    ...project,
    documentType: project.documentType || "Sensitive document",
    imageAdjustments: { ...defaults.imageAdjustments, ...project.imageAdjustments },
    watermarkSettings: { ...defaults.watermarkSettings, ...project.watermarkSettings },
    safeZones: project.safeZones ?? [],
    exportHistory: project.exportHistory ?? [],
    appVersion: project.appVersion || defaults.appVersion
  });
}

export function sourcePathForProject(project: LocalWatermarkerProject) {
  if (project.sourceMode === "copy" && project.sourceCopiedPath) return project.sourceCopiedPath;
  return project.sourceOriginalPath;
}
