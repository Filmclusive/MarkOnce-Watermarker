import { save } from "@tauri-apps/plugin-dialog";
import { useMemo, useState } from "react";
import { APP_COPY } from "../../constants/app";
import { canvasToDataUrl, hashText, writeExportFile } from "../../lib/image/exportImage";
import { renderFlattenedImage } from "../../lib/image/renderFlattenedImage";
import { exportImageAsPdf } from "../../lib/pdf/exportImageAsPdf";
import { buildExportFilename } from "../../lib/projects/filename";
import { createExportRecord } from "../../lib/history/exportRecordSchema";
import { getProjectExportPath } from "../../lib/projects/projectStorage";
import { openNativePath, showNativePathInFolder } from "../../lib/runtime/native";
import type { ExportFormat } from "../../types/exportRecord";
import type { LocalWatermarkerProject } from "../../types/project";

interface ExportPanelProps {
  image: HTMLImageElement;
  project: LocalWatermarkerProject;
  onExported: (project: LocalWatermarkerProject, message: string) => void;
  onError: (message: string) => void;
}

export function ExportPanel({ image, project, onExported, onError }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [quality, setQuality] = useState(0.92);
  const [fileName, setFileName] = useState(() => buildExportFilename(project, "pdf"));
  const [lastPath, setLastPath] = useState("");
  const [busy, setBusy] = useState(false);
  const suggestedName = useMemo(() => buildExportFilename(project, format), [project, format]);

  function updateFormat(nextFormat: ExportFormat) {
    setFormat(nextFormat);
    setFileName((current) => {
      const stem = current.replace(/\.(pdf|png|jpg)$/i, "");
      return `${stem || buildExportFilename(project, nextFormat).replace(/\.[^.]+$/, "")}.${nextFormat}`;
    });
  }

  async function exportFile() {
    if (busy) return;
    setBusy(true);
    try {
      const exportName = fileName || suggestedName;
      const defaultPath = await getProjectExportPath(project.projectId, exportName);
      const targetPath = await save({
        defaultPath,
        filters: [{ name: format.toUpperCase(), extensions: [format] }]
      });
      if (!targetPath) return;

      const canvas = renderFlattenedImage(image, project, {
        includeWatermark: true,
        fillBackground: format === "jpg" || format === "pdf" ? "#ffffff" : undefined
      });
      const dataUrl = format === "pdf" ? await exportImageAsPdf(canvas) : await canvasToDataUrl(canvas, format, quality);
      const written = await writeExportFile(targetPath, dataUrl);
      const settingsHash = await hashText(JSON.stringify(project.watermarkSettings));
      const record = createExportRecord({
        project,
        format,
        exportPath: written.path,
        exportFileName: fileNameFromTarget(written.path),
        exportFileHash: written.hash,
        watermarkSettingsHash: settingsHash
      });
      const nextProject = {
        ...project,
        exportHistory: [record, ...project.exportHistory]
      };
      setLastPath(written.path);
      onExported(nextProject, APP_COPY.exportSuccess);
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="control-group">
      <h2>Export</h2>
      <div className="segmented">
        {(["pdf", "png", "jpg"] as ExportFormat[]).map((item) => (
          <button type="button" key={item} className={format === item ? "active" : ""} onClick={() => updateFormat(item)}>
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      <label>
        <span>Filename</span>
        <input value={fileName} onChange={(event) => setFileName(event.target.value)} />
      </label>
      {format === "jpg" ? (
        <label>
          <span>JPG quality <small>{quality.toFixed(2)}</small></span>
          <input type="range" min={0.6} max={1} step={0.01} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
        </label>
      ) : null}
      <button type="button" className="primary-action full-width" onClick={exportFile} disabled={busy}>
        Export
      </button>
      {lastPath ? (
        <div className="button-grid">
          <button type="button" onClick={() => openNativePath(lastPath)}>
            Open exported file
          </button>
          <button type="button" onClick={() => showNativePathInFolder(lastPath)}>
            Show in folder
          </button>
        </div>
      ) : null}
    </section>
  );
}

function fileNameFromTarget(path: string) {
  return path.split(/[\\/]/).filter(Boolean).at(-1) ?? path;
}
