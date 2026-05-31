import { getRotatedSize, normalizeCrop, normalizeRotation, safeZoneToOutputRect } from "./geometry";
import { renderTextWatermark } from "../watermark/renderTextWatermark";
import type { LocalWatermarkerProject } from "../../types/project";

export interface RenderOptions {
  includeWatermark: boolean;
  fillBackground?: string;
}

export function renderFlattenedImage(
  image: HTMLImageElement,
  project: LocalWatermarkerProject,
  options: RenderOptions = { includeWatermark: true }
) {
  const crop = normalizeCrop(project.imageAdjustments);
  const rotation = normalizeRotation(project.imageAdjustments.rotationDegrees);
  const outputSize = getRotatedSize(crop, rotation);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outputSize.width));
  canvas.height = Math.max(1, Math.round(outputSize.height));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is unavailable.");

  if (options.fillBackground) {
    context.fillStyle = options.fillBackground;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.save();
  applyRotationTransform(context, crop.width, crop.height, rotation);
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  context.restore();

  if (options.includeWatermark) {
    const safeZones = project.safeZones
      .map((zone) => safeZoneToOutputRect(zone, crop, rotation))
      .filter((zone) => zone !== null);
    renderTextWatermark(context, project.watermarkSettings, canvas.width, canvas.height, safeZones);
  }

  return canvas;
}

function applyRotationTransform(
  context: CanvasRenderingContext2D,
  cropWidth: number,
  cropHeight: number,
  rotation: number
) {
  if (rotation === 90) {
    context.translate(cropHeight, 0);
    context.rotate(Math.PI / 2);
  } else if (rotation === 180) {
    context.translate(cropWidth, cropHeight);
    context.rotate(Math.PI);
  } else if (rotation === 270) {
    context.translate(0, cropWidth);
    context.rotate((Math.PI * 3) / 2);
  }
}
