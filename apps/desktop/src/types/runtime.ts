import type { LocalWatermarkerProject } from "./project";

export type Screen = "dashboard" | "editor" | "history" | "settings";

export interface AppNotice {
  tone: "info" | "success" | "warning" | "danger";
  message: string;
}

export interface AppData {
  projects: LocalWatermarkerProject[];
}
