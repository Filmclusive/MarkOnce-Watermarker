export type WatermarkPresetId = "light" | "standard" | "dense" | "custom";

export interface WatermarkSettings {
  templateId: string;
  customText: string;
  recipient: string;
  purpose: string;
  date: string;
  resolvedText: string;
  preset: WatermarkPresetId;
  opacity: number;
  rotationDegrees: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  tileSpacingX: number;
  tileSpacingY: number;
  lineHeight: number;
  safeZoneOpacityMultiplier: number;
}

export interface SafeZone {
  safeZoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacityMultiplier: number;
}
