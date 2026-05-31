import { RECENT_CLEAR_KEY } from "../../constants/storage";
import type { LocalWatermarkerProject } from "../../types/project";

export function getRecentClearAt() {
  return window.localStorage.getItem(RECENT_CLEAR_KEY) ?? "";
}

export function clearRecentFiles() {
  const timestamp = new Date().toISOString();
  window.localStorage.setItem(RECENT_CLEAR_KEY, timestamp);
  return timestamp;
}

export function filterRecentProjects(projects: LocalWatermarkerProject[]) {
  const clearAt = getRecentClearAt();
  if (!clearAt) return projects;
  return projects.filter((project) => project.updatedAt > clearAt);
}
