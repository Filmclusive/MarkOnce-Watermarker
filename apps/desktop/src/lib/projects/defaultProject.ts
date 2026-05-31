import { APP_VERSION, DEFAULT_FONT_FAMILY } from "../../constants/app";
import type { ImageAdjustments } from "../../types/imageAdjustments";
import type { WatermarkSettings } from "../../types/watermark";

export function createDefaultAdjustments(): ImageAdjustments {
  return {
    rotationDegrees: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    originalWidth: 0,
    originalHeight: 0
  };
}

export function createDefaultWatermarkSettings(): WatermarkSettings {
  return {
    templateId: "recipient-purpose-date",
    customText: "",
    recipient: "",
    purpose: "",
    date: new Date().toISOString().slice(0, 10),
    resolvedText: "",
    preset: "standard",
    opacity: 0.2,
    rotationDegrees: -30,
    fontSize: 42,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: 600,
    color: "#1f2937",
    tileSpacingX: 280,
    tileSpacingY: 190,
    lineHeight: 1.24,
    safeZoneOpacityMultiplier: 0.5
  };
}

export function getDefaultProjectFields() {
  return {
    imageAdjustments: createDefaultAdjustments(),
    watermarkSettings: createDefaultWatermarkSettings(),
    safeZones: [],
    exportHistory: [],
    appVersion: APP_VERSION
  };
}
