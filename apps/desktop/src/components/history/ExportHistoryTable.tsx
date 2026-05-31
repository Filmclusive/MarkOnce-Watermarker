import { useEffect, useState } from "react";
import { doesFileExist, openNativePath, showNativePathInFolder } from "../../lib/runtime/native";
import { formatDateTime, shortHash } from "../../lib/runtime/format";
import type { ExportRecord } from "../../types/exportRecord";
import type { LocalWatermarkerProject } from "../../types/project";

interface ExportHistoryTableProps {
  projects: LocalWatermarkerProject[];
  onDeleteRecord: (projectId: string, exportId: string) => void;
}

export function ExportHistoryTable({ projects, onDeleteRecord }: ExportHistoryTableProps) {
  const [existingPaths, setExistingPaths] = useState<Record<string, boolean>>({});
  const records = projects
    .flatMap((project) =>
      project.exportHistory.map((record) => ({
        ...record,
        projectName: project.projectName
      }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  useEffect(() => {
    let active = true;
    Promise.all(records.map((record) => doesFileExist(record.exportPath).then((exists) => [record.exportId, exists])))
      .then((entries) => {
        if (active) setExistingPaths(Object.fromEntries(entries));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [records.map((record) => record.exportId).join("|")]);

  if (records.length === 0) return <p className="muted">No export history.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th>Recipient</th>
            <th>Purpose</th>
            <th>Format</th>
            <th>Filename</th>
            <th>Hash</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const exists = existingPaths[record.exportId];
            return (
              <tr key={record.exportId}>
                <td>{formatDateTime(record.createdAt)}</td>
                <td>{record.projectName}</td>
                <td>{record.recipient}</td>
                <td>{record.purpose}</td>
                <td>{record.format.toUpperCase()}</td>
                <td>{record.exportFileName}</td>
                <td className="mono">{shortHash(record.exportFileHash)}</td>
                <td>
                  <div className="table-actions">
                    {exists ? (
                      <>
                        <button type="button" onClick={() => openNativePath(record.exportPath)}>
                          Open
                        </button>
                        <button type="button" onClick={() => showNativePathInFolder(record.exportPath)}>
                          Folder
                        </button>
                      </>
                    ) : (
                      <span className="missing-file">Missing</span>
                    )}
                    <button type="button" onClick={() => onDeleteRecord(record.projectId, record.exportId)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
