import { DEFAULT_TEMPLATES } from "../templates/defaultTemplates";
import type { LocalWatermarkerProject } from "../../types/project";
import type { WatermarkSettings } from "../../types/watermark";

function normalizeValue(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function buildWatermarkText(settings: WatermarkSettings, documentName: string) {
  const template =
    DEFAULT_TEMPLATES.find((item) => item.id === settings.templateId) ?? DEFAULT_TEMPLATES[0];
  const source = settings.templateId === "custom" ? settings.customText : template.text;

  return source
    .replaceAll("[RECIPIENT]", normalizeValue(settings.recipient, "RECIPIENT"))
    .replaceAll("[PURPOSE]", normalizeValue(settings.purpose, "Purpose"))
    .replaceAll("[DATE]", normalizeValue(settings.date, new Date().toISOString().slice(0, 10)))
    .replaceAll("[DOCUMENT_NAME]", normalizeValue(documentName, "Document"));
}

export function withResolvedWatermark(project: LocalWatermarkerProject) {
  return {
    ...project,
    watermarkSettings: {
      ...project.watermarkSettings,
      resolvedText: buildWatermarkText(project.watermarkSettings, project.sourceFileName)
    }
  };
}
