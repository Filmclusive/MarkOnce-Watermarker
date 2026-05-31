import { open } from "@tauri-apps/plugin-dialog";
import { APP_COPY } from "../constants/app";
import { openProject } from "../lib/projects/projectStorage";
import { filterRecentProjects } from "../lib/runtime/settings";
import { isTauriRuntime } from "../lib/runtime/tauri";
import { hydrateProject } from "../lib/projects/projectSchema";
import { formatDateTime } from "../lib/runtime/format";
import { NewProjectDialog } from "../components/projects/NewProjectDialog";
import { RecentProjects } from "../components/projects/RecentProjects";
import type { LocalWatermarkerProject } from "../types/project";

interface DashboardProps {
  projects: LocalWatermarkerProject[];
  showNewProject: boolean;
  onShowNewProject: (show: boolean) => void;
  onOpenProject: (project: LocalWatermarkerProject) => void;
  onError: (message: string) => void;
}

export function Dashboard({
  projects,
  showNewProject,
  onShowNewProject,
  onOpenProject,
  onError
}: DashboardProps) {
  const recentProjects = filterRecentProjects(projects);
  const recentExports = recentProjects
    .flatMap((project) =>
      project.exportHistory.map((record) => ({
        ...record,
        projectName: project.projectName
      }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  async function chooseProjectFile() {
    if (!isTauriRuntime()) {
      onError("Run the desktop app to use native file actions.");
      return;
    }
    const selected = await open({
      multiple: false,
      filters: [{ name: "Local Watermarker project", extensions: ["json"] }]
    });
    if (typeof selected !== "string") return;

    try {
      onOpenProject(hydrateProject(await openProject(selected)));
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="page">
      <section className="hero-band">
        <div>
          <h1>Local Watermarker</h1>
          <p>{APP_COPY.privacyNote}</p>
          <p>{APP_COPY.limitationNote}</p>
        </div>
        <div className="action-row">
          <button type="button" className="primary-action" onClick={() => onShowNewProject(true)}>
            New project
          </button>
          <button type="button" className="secondary-action" onClick={chooseProjectFile}>
            Open project
          </button>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Recent projects</h2>
        </div>
        <RecentProjects projects={recentProjects} onOpen={onOpenProject} />
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Recent exports</h2>
        </div>
        {recentExports.length === 0 ? (
          <p className="muted">No recent exports.</p>
        ) : (
          <div className="compact-list">
            {recentExports.map((record) => (
              <div className="compact-row" key={record.exportId}>
                <span>{formatDateTime(record.createdAt)}</span>
                <strong>{record.projectName}</strong>
                <span>{record.recipient || "No recipient"}</span>
                <span>{record.format.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <NewProjectDialog
        openDialog={showNewProject}
        onCancel={() => onShowNewProject(false)}
        onCreated={onOpenProject}
        onError={onError}
      />
    </main>
  );
}
