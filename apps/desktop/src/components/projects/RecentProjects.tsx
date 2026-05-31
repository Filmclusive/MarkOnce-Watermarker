import { formatDateTime } from "../../lib/runtime/format";
import type { LocalWatermarkerProject } from "../../types/project";

interface RecentProjectsProps {
  projects: LocalWatermarkerProject[];
  onOpen: (project: LocalWatermarkerProject) => void;
}

export function RecentProjects({ projects, onOpen }: RecentProjectsProps) {
  if (projects.length === 0) {
    return <p className="muted">No recent projects.</p>;
  }

  return (
    <div className="project-grid">
      {projects.slice(0, 6).map((project) => {
        const lastExport = project.exportHistory[0];
        return (
          <button
            type="button"
            className="project-card"
            key={project.projectId}
            onClick={() => onOpen(project)}
          >
            <span className="document-icon" aria-hidden="true">
              ▧
            </span>
            <span className="project-card-body">
              <span className="project-name">{project.projectName}</span>
              <span>{project.documentType}</span>
              <span>{lastExport ? formatDateTime(lastExport.createdAt) : "No exports yet"}</span>
              <span>{lastExport?.recipient || "No recipient yet"}</span>
              <span>{project.exportHistory.length} exports</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
