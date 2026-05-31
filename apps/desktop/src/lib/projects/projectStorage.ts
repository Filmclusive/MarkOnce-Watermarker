import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime, requireTauriRuntime } from "../runtime/tauri";
import type { LocalWatermarkerProject, SourceFileInfo, SourceMode } from "../../types/project";

export function listProjects() {
  if (!isTauriRuntime()) return Promise.resolve([]);
  return invoke<LocalWatermarkerProject[]>("list_projects");
}

export function createProjectFromSource(input: {
  sourcePath: string;
  sourceMode: SourceMode;
  projectName: string;
  documentType: string;
}) {
  requireTauriRuntime();
  return invoke<LocalWatermarkerProject>("create_project_from_source", input);
}

export function openProject(projectPath: string) {
  requireTauriRuntime();
  return invoke<LocalWatermarkerProject>("open_project", { projectPath });
}

export function saveProject(project: LocalWatermarkerProject) {
  requireTauriRuntime();
  return invoke<LocalWatermarkerProject>("save_project", { project });
}

export function deleteProject(projectId: string) {
  requireTauriRuntime();
  return invoke<void>("delete_project", { projectId });
}

export function getSourceFileInfo(path: string) {
  requireTauriRuntime();
  return invoke<SourceFileInfo>("get_source_file_info", { path });
}

export function copySourceIntoProject(projectId: string, sourcePath: string) {
  requireTauriRuntime();
  return invoke<string>("copy_source_into_project", { projectId, sourcePath });
}

export function getProjectExportPath(projectId: string, fileName: string) {
  requireTauriRuntime();
  return invoke<string>("project_export_path", { projectId, fileName });
}
