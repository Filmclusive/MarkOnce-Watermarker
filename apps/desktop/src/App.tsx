import { useEffect, useMemo, useState } from "react";
import { NoticeBar } from "./components/common/NoticeBar";
import { Dashboard } from "./pages/Dashboard";
import { ExportHistory } from "./pages/ExportHistory";
import { ProjectEditor } from "./pages/ProjectEditor";
import { Settings } from "./pages/Settings";
import { APP_NAME } from "./constants/app";
import { deleteProject, listProjects, saveProject } from "./lib/projects/projectStorage";
import { hydrateProject } from "./lib/projects/projectSchema";
import type { LocalWatermarkerProject } from "./types/project";
import type { AppNotice, Screen } from "./types/runtime";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [projects, setProjects] = useState<LocalWatermarkerProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const activeProject = useMemo(
    () => projects.find((project) => project.projectId === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  useEffect(() => {
    refreshProjects().catch((error) => showError(error instanceof Error ? error.message : String(error)));
  }, []);

  async function refreshProjects() {
    const loaded = await listProjects();
    setProjects(loaded.map(hydrateProject));
  }

  function showError(message: string) {
    setNotice({ tone: "danger", message });
  }

  function showSuccess(message: string) {
    setNotice({ tone: "success", message });
  }

  function upsertProject(project: LocalWatermarkerProject) {
    const hydrated = hydrateProject(project);
    setProjects((current) => {
      const exists = current.some((item) => item.projectId === hydrated.projectId);
      const next = exists
        ? current.map((item) => (item.projectId === hydrated.projectId ? hydrated : item))
        : [hydrated, ...current];
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
    setActiveProjectId(hydrated.projectId);
    setShowNewProject(false);
    setScreen("editor");
  }

  async function persistProject(project: LocalWatermarkerProject) {
    const saved = hydrateProject(await saveProject(project));
    upsertProject(saved);
  }

  async function removeProject(project: LocalWatermarkerProject) {
    await deleteProject(project.projectId);
    setProjects((current) => current.filter((item) => item.projectId !== project.projectId));
    setActiveProjectId("");
    setScreen("dashboard");
    showSuccess("Project deleted.");
  }

  async function deleteExportRecord(projectId: string, exportId: string) {
    const project = projects.find((item) => item.projectId === projectId);
    if (!project) return;
    const updated = {
      ...project,
      exportHistory: project.exportHistory.filter((record) => record.exportId !== exportId)
    };
    await persistProject(updated);
    showSuccess("Export history item deleted.");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="brand-button" onClick={() => setScreen("dashboard")}>
          {APP_NAME}
        </button>
        <nav>
          <button type="button" className={screen === "dashboard" ? "active" : ""} onClick={() => setScreen("dashboard")}>
            Dashboard
          </button>
          <button type="button" className={screen === "history" ? "active" : ""} onClick={() => setScreen("history")}>
            History
          </button>
          <button type="button" className={screen === "settings" ? "active" : ""} onClick={() => setScreen("settings")}>
            Settings
          </button>
        </nav>
      </header>

      <NoticeBar notice={notice} onDismiss={() => setNotice(null)} />

      {screen === "dashboard" ? (
        <Dashboard
          projects={projects}
          showNewProject={showNewProject}
          onShowNewProject={setShowNewProject}
          onOpenProject={upsertProject}
          onError={showError}
        />
      ) : null}

      {screen === "editor" && activeProject ? (
        <ProjectEditor
          project={activeProject}
          onProjectChange={upsertProject}
          onSave={persistProject}
          onDelete={removeProject}
          onError={showError}
          onSuccess={showSuccess}
        />
      ) : null}

      {screen === "history" ? <ExportHistory projects={projects} onDeleteRecord={deleteExportRecord} /> : null}

      {screen === "settings" ? (
        <Settings
          onRecentCleared={() => {
            showSuccess("Recent files cleared.");
            refreshProjects().catch(() => undefined);
          }}
        />
      ) : null}
    </div>
  );
}
