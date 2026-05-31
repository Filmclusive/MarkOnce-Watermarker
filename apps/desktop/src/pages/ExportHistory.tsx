import { ExportHistoryTable } from "../components/history/ExportHistoryTable";
import type { LocalWatermarkerProject } from "../types/project";

interface ExportHistoryProps {
  projects: LocalWatermarkerProject[];
  onDeleteRecord: (projectId: string, exportId: string) => void;
}

export function ExportHistory({ projects, onDeleteRecord }: ExportHistoryProps) {
  return (
    <main className="page">
      <section className="content-section">
        <div className="section-header">
          <h1>Export history</h1>
        </div>
        <ExportHistoryTable projects={projects} onDeleteRecord={onDeleteRecord} />
      </section>
    </main>
  );
}
