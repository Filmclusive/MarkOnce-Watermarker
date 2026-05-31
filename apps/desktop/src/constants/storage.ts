export const RECENT_CLEAR_KEY = "local-watermarker:recent-clear-at";

export const SOURCE_MODE_OPTIONS = [
  {
    id: "reference",
    label: "Reference original file only",
    detail: "More private, but you may need to reconnect the file if it moves."
  },
  {
    id: "copy",
    label: "Copy source into project folder",
    detail: "Easier to reuse, but this app stores a local copy of the sensitive document."
  }
] as const;
