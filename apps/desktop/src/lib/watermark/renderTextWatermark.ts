import type { Rect } from "../image/geometry";
import type { WatermarkSettings } from "../../types/watermark";

export function renderTextWatermark(
  context: CanvasRenderingContext2D,
  settings: WatermarkSettings,
  width: number,
  height: number,
  safeZones: Rect[]
) {
  const text = settings.resolvedText.trim();
  if (!text) return;

  drawClippedTiles(context, settings, width, height, settings.opacity, safeZones, true);
  for (const zone of safeZones) {
    context.save();
    context.beginPath();
    context.rect(zone.x, zone.y, zone.width, zone.height);
    context.clip();
    drawTiles(context, settings, width, height, settings.opacity * settings.safeZoneOpacityMultiplier);
    context.restore();
  }
}

function drawClippedTiles(
  context: CanvasRenderingContext2D,
  settings: WatermarkSettings,
  width: number,
  height: number,
  opacity: number,
  safeZones: Rect[],
  useEvenOdd: boolean
) {
  context.save();
  const path = new Path2D();
  path.rect(0, 0, width, height);
  for (const zone of safeZones) {
    path.rect(zone.x, zone.y, zone.width, zone.height);
  }
  context.clip(path, useEvenOdd ? "evenodd" : "nonzero");
  drawTiles(context, settings, width, height, opacity);
  context.restore();
}

function drawTiles(
  context: CanvasRenderingContext2D,
  settings: WatermarkSettings,
  width: number,
  height: number,
  opacity: number
) {
  const lines = settings.resolvedText.split("\n").filter((line) => line.trim().length > 0);
  const fontSize = Math.max(10, settings.fontSize);
  const lineHeight = fontSize * settings.lineHeight;
  const tileWidth = Math.max(settings.tileSpacingX, fontSize * 4);
  const tileHeight = Math.max(settings.tileSpacingY, lineHeight * lines.length + 24);
  const overscan = Math.max(width, height);

  context.globalAlpha = opacity;
  context.fillStyle = settings.color;
  context.font = `${settings.fontWeight} ${fontSize}px ${settings.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let y = -overscan; y <= height + overscan; y += tileHeight) {
    for (let x = -overscan; x <= width + overscan; x += tileWidth) {
      context.save();
      context.translate(x, y);
      context.rotate((settings.rotationDegrees * Math.PI) / 180);
      lines.forEach((line, index) => {
        const offset = (index - (lines.length - 1) / 2) * lineHeight;
        context.fillText(line, 0, offset);
      });
      context.restore();
    }
  }

  context.globalAlpha = 1;
}
