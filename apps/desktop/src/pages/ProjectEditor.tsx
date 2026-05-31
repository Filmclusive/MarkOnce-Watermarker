import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useMemo, useState } from "react";
import { APP_COPY, SUPPORTED_INPUT_EXTENSIONS } from "../constants/app";
import { CropControls } from "../components/editor/CropControls";
import { ExportPanel } from "../components/editor/ExportPanel";
import { ImageCanvas } from "../components/editor/ImageCanvas";
import { SafeZoneOverlay } from "../components/editor/SafeZoneOverlay";
import { WatermarkControls } from "../components/editor/WatermarkControls";
import { loadImageFromDataUrl, readImageDataUrl } from "../lib/image/loadImageFile";
import { copySourceIntoProject, getSourceFileInfo } from "../lib/projects/projectStorage";
import { sourcePathForProject } from "../lib/projects/projectSchema";
import { withResolvedWatermark } from "../lib/watermark/buildWatermarkText";
import type { ImageAdjustments } from "../types/imageAdjustments";
import type { LocalWatermarkerProject } from "../types/project";
import type { SafeZone, WatermarkSettings } from "../types/watermark";

interface ProjectEditorProps {
  project: LocalWatermarkerProject;
  onProjectChange: (project: LocalWatermarkerProject) => void;
  onSave: (project: LocalWatermarkerProject) => Promise<void>;
  onDelete: (project: LocalWatermarkerProject) => Promise<void>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

type Mode = "view" | "crop" | "safe-zone";

export function ProjectEditor({
  project,
  onProjectChange,
  onSave,
  onDelete,
  onError,
  onSuccess
}: ProjectEditorProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourceMissing, setSourceMissing] = useState(false);
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [mode, setMode] = useState<Mode>("view");
  const [zoom, setZoom] = useState(1);
  const [selectedSafeZoneId, setSelectedSafeZoneId] = useState("");
  const [busy, setBusy] = useState(false);
  const sourcePath = useMemo(() => sourcePathForProject(project), [project]);

  useEffect(() => {
    let active = true;
    setSourceMissing(false);
    readImageDataUrl(sourcePath)
      .then(loadImageFromDataUrl)
      .then((loadedImage) => {
        if (!active) return;
        setImage(loadedImage);
        if (
          project.imageAdjustments.originalWidth !== loadedImage.naturalWidth ||
          project.imageAdjustments.originalHeight !== loadedImage.naturalHeight
        ) {
          updateAdjustments({
            ...project.imageAdjustments,
            originalWidth: loadedImage.naturalWidth,
            originalHeight: loadedImage.naturalHeight,
            cropX: 0,
            cropY: 0,
            cropWidth: loadedImage.naturalWidth,
            cropHeight: loadedImage.naturalHeight
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setImage(null);
        setSourceMissing(true);
      });
    return () => {
      active = false;
    };
  }, [sourcePath]);

  function patchProject(patch: Partial<LocalWatermarkerProject>) {
    onProjectChange(withResolvedWatermark({ ...project, ...patch, updatedAt: new Date().toISOString() }));
  }

  function updateAdjustments(imageAdjustments: ImageAdjustments) {
    patchProject({ imageAdjustments });
  }

  function updateWatermark(watermarkSettings: WatermarkSettings) {
    patchProject({ watermarkSettings });
  }

  function updateSafeZones(safeZones: SafeZone[]) {
    patchProject({ safeZones });
  }

  async function reconnectSource() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: [...SUPPORTED_INPUT_EXTENSIONS] }]
    });
    if (typeof selected !== "string") return;

    try {
      const info = await getSourceFileInfo(selected);
      if (project.sourceFileHash && info.fileHash !== project.sourceFileHash) {
        const confirmed = window.confirm("This file hash differs from the original. Use it anyway?");
        if (!confirmed) return;
      }
      const sourceCopiedPath = project.sourceMode === "copy" ? await copySourceIntoProject(project.projectId, selected) : "";
      patchProject({
        sourceOriginalPath: selected,
        sourceCopiedPath,
        sourceFileName: info.fileName,
        sourceFileType: info.fileType,
        sourceFileHash: info.fileHash,
        sourceFileSize: info.fileSize,
        sourceLastModifiedAt: info.lastModifiedAt
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  }

  async function saveCurrentProject() {
    setBusy(true);
    try {
      await onSave(project);
      onSuccess("Project saved.");
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveExportedProject(nextProject: LocalWatermarkerProject, message: string) {
    onProjectChange(nextProject);
    try {
      await onSave(nextProject);
      onSuccess(message);
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  }

  async function deleteCurrentProject() {
    const confirmed = window.confirm("Delete this project and its local project folder?");
    if (!confirmed) return;
    await onDelete(project);
  }

  return (
    <main className="editor-page">
      <section className="editor-main">
        <div className="editor-header">
          <div>
            <h1>{project.projectName}</h1>
            <p>{APP_COPY.privacyNote}</p>
          </div>
          <div className="action-row">
            <button type="button" className="secondary-action" onClick={() => setIncludeWatermark((value) => !value)}>
              {includeWatermark ? "Before" : "After"}
            </button>
            <label className="inline-control">
              <span>Zoom</span>
              <input type="range" min={0.25} max={2} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>
            <button type="button" className="secondary-action" onClick={() => setZoom(1)}>
              Fit
            </button>
          </div>
        </div>

        {sourceMissing ? (
          <div className="empty-state">
            <p>{APP_COPY.sourceMissing}</p>
            <button type="button" className="primary-action" onClick={reconnectSource}>
              Reconnect source file
            </button>
          </div>
        ) : null}

        {image ? (
          <ImageCanvas
            image={image}
            project={project}
            includeWatermark={includeWatermark}
            interactionMode={mode}
            zoom={zoom}
            selectedSafeZoneId={selectedSafeZoneId}
            onAdjustmentsChange={updateAdjustments}
            onSafeZonesChange={updateSafeZones}
            onSelectedSafeZoneChange={setSelectedSafeZoneId}
          />
        ) : null}
      </section>

      <aside className="editor-sidebar">
        <CropControls adjustments={project.imageAdjustments} mode={mode} onModeChange={setMode} onAdjustmentsChange={updateAdjustments} />
        <WatermarkControls settings={project.watermarkSettings} onChange={updateWatermark} />
        <SafeZoneOverlay
          safeZones={project.safeZones}
          selectedSafeZoneId={selectedSafeZoneId}
          onSelectedSafeZoneChange={setSelectedSafeZoneId}
          onSafeZonesChange={updateSafeZones}
        />
        {image ? <ExportPanel image={image} project={project} onExported={saveExportedProject} onError={onError} /> : null}
        <section className="control-group">
          <h2>Project</h2>
          <button type="button" className="primary-action full-width" onClick={saveCurrentProject} disabled={busy}>
            Save project
          </button>
          <button type="button" onClick={reconnectSource}>
            Reconnect source file
          </button>
          <button type="button" className="danger-action" onClick={deleteCurrentProject}>
            Delete project
          </button>
        </section>
      </aside>
    </main>
  );
}
