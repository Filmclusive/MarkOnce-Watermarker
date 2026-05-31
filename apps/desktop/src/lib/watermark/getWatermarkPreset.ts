import type { WatermarkPresetId, WatermarkSettings } from "../../types/watermark";

export interface WatermarkPreset {
  id: WatermarkPresetId;
  label: string;
  purpose: string;
  opacity: number;
  rotationDegrees: number;
  fontSize: number;
  tileSpacingX: number;
  tileSpacingY: number;
}

export const WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: "light",
    label: "Light",
    purpose: "Lowest obstruction",
    opacity: 0.12,
    rotationDegrees: -30,
    fontSize: 34,
    tileSpacingX: 360,
    tileSpacingY: 240
  },
  {
    id: "standard",
    label: "Standard",
    purpose: "Normal use",
    opacity: 0.2,
    rotationDegrees: -30,
    fontSize: 42,
    tileSpacingX: 280,
    tileSpacingY: 190
  },
  {
    id: "dense",
    label: "Dense",
    purpose: "Strongest visible deterrent",
    opacity: 0.28,
    rotationDegrees: -30,
    fontSize: 52,
    tileSpacingX: 220,
    tileSpacingY: 150
  }
];

export function getWatermarkPreset(id: WatermarkPresetId) {
  return WATERMARK_PRESETS.find((preset) => preset.id === id) ?? WATERMARK_PRESETS[1];
}

export function applyPreset(settings: WatermarkSettings, presetId: WatermarkPresetId) {
  if (presetId === "custom") {
    return { ...settings, preset: "custom" };
  }

  const preset = getWatermarkPreset(presetId);
  return {
    ...settings,
    preset: preset.id,
    opacity: preset.opacity,
    rotationDegrees: preset.rotationDegrees,
    fontSize: preset.fontSize,
    tileSpacingX: preset.tileSpacingX,
    tileSpacingY: preset.tileSpacingY
  };
}
