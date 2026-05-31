export const APP_VERSION = "0.1.0";
export const APP_NAME = "Local Watermarker";

export const APP_COPY = {
  privacyNote: "Files stay on this device. The app does not upload your documents.",
  limitationNote:
    "Watermarks discourage reuse and create context. They do not fully prevent editing or fraud.",
  sourceMissing:
    "Source file moved or no longer exists. Reconnect the source image to keep using this project.",
  exportSuccess: "Watermarked file exported. Export log saved locally."
} as const;

export const SUPPORTED_INPUT_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "heic", "heif"] as const;

export const DEFAULT_FONT_FAMILY = "Verdana, Inter, sans-serif";

export const DOCUMENT_TYPES = [
  "Passport",
  "ID card",
  "Proof of address",
  "Sensitive document"
] as const;
