import type { ImageAdjustments } from "../../types/imageAdjustments";
import type { SafeZone } from "../../types/watermark";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function normalizeCrop(adjustments: ImageAdjustments): Rect {
  const width = adjustments.originalWidth;
  const height = adjustments.originalHeight;
  const cropWidth = adjustments.cropWidth > 0 ? adjustments.cropWidth : width;
  const cropHeight = adjustments.cropHeight > 0 ? adjustments.cropHeight : height;

  return {
    x: clamp(adjustments.cropX, 0, width),
    y: clamp(adjustments.cropY, 0, height),
    width: clamp(cropWidth, 1, width),
    height: clamp(cropHeight, 1, height)
  };
}

export function normalizeRotation(degrees: number) {
  return ((Math.round(degrees / 90) * 90) % 360 + 360) % 360;
}

export function getRotatedSize(crop: Rect, rotationDegrees: number) {
  const rotation = normalizeRotation(rotationDegrees);
  return rotation === 90 || rotation === 270
    ? { width: crop.height, height: crop.width }
    : { width: crop.width, height: crop.height };
}

export function mapOutputPointToOriginal(
  outputX: number,
  outputY: number,
  crop: Rect,
  rotationDegrees: number
) {
  const rotation = normalizeRotation(rotationDegrees);
  if (rotation === 90) return { x: crop.x + outputY, y: crop.y + crop.height - outputX };
  if (rotation === 180) return { x: crop.x + crop.width - outputX, y: crop.y + crop.height - outputY };
  if (rotation === 270) return { x: crop.x + crop.width - outputY, y: crop.y + outputX };
  return { x: crop.x + outputX, y: crop.y + outputY };
}

export function mapOriginalPointToOutput(
  originalX: number,
  originalY: number,
  crop: Rect,
  rotationDegrees: number
) {
  const x = originalX - crop.x;
  const y = originalY - crop.y;
  const rotation = normalizeRotation(rotationDegrees);

  if (rotation === 90) return { x: crop.height - y, y: x };
  if (rotation === 180) return { x: crop.width - x, y: crop.height - y };
  if (rotation === 270) return { x: y, y: crop.width - x };
  return { x, y };
}

export function safeZoneToOutputRect(zone: SafeZone, crop: Rect, rotationDegrees: number): Rect | null {
  const clipped = intersectRects(zone, crop);
  if (!clipped) return null;

  const corners = [
    mapOriginalPointToOutput(clipped.x, clipped.y, crop, rotationDegrees),
    mapOriginalPointToOutput(clipped.x + clipped.width, clipped.y, crop, rotationDegrees),
    mapOriginalPointToOutput(clipped.x, clipped.y + clipped.height, crop, rotationDegrees),
    mapOriginalPointToOutput(clipped.x + clipped.width, clipped.y + clipped.height, crop, rotationDegrees)
  ];

  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function rectFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y)
  };
}

export function clampRectToBounds(rect: Rect, bounds: Rect): Rect {
  const x = clamp(rect.x, bounds.x, bounds.x + bounds.width);
  const y = clamp(rect.y, bounds.y, bounds.y + bounds.height);
  const right = clamp(rect.x + rect.width, bounds.x, bounds.x + bounds.width);
  const bottom = clamp(rect.y + rect.height, bounds.y, bounds.y + bounds.height);
  return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function intersectRects(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= x || bottom <= y) return null;
  return { x, y, width: right - x, height: bottom - y };
}
