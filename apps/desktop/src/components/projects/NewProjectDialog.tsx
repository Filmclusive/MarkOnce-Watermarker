import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { DOCUMENT_TYPES, SUPPORTED_INPUT_EXTENSIONS } from "../../constants/app";
import { SOURCE_MODE_OPTIONS } from "../../constants/storage";
import { createProjectFromSource } from "../../lib/projects/projectStorage";
import { hydrateProject } from "../../lib/projects/projectSchema";
import { fileNameFromPath } from "../../lib/runtime/format";
import { isTauriRuntime } from "../../lib/runtime/tauri";
import type { LocalWatermarkerProject, SourceMode } from "../../types/project";

interface NewProjectDialogProps {
  openDialog: boolean;
  onCancel: () => void;
  onCreated: (project: LocalWatermarkerProject) => void;
  onError: (message: string) => void;
}

export function NewProjectDialog({ openDialog, onCancel, onCreated, onError }: NewProjectDialogProps) {
  const [sourcePath, setSourcePath] = useState("");
  const [projectName, setProjectName] = useState("");
  const [documentType, setDocumentType] = useState("Passport");
  const [sourceMode, setSourceMode] = useState<SourceMode>("reference");
  const [busy, setBusy] = useState(false);

  if (!openDialog) return null;

  async function chooseImage() {
    if (!isTauriRuntime()) {
      onError("Run the desktop app to use native file actions.");
      return;
    }
    const selected = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: [...SUPPORTED_INPUT_EXTENSIONS] }]
    });
    if (typeof selected !== "string") return;

    setSourcePath(selected);
    setProjectName((current) => current || fileNameFromPath(selected).replace(/\.[^.]+$/, ""));
  }

  async function createProject() {
    if (!sourcePath || busy) return;
    setBusy(true);
    try {
      const project = await createProjectFromSource({
        sourcePath,
        sourceMode,
        projectName,
        documentType
      });
      onCreated(hydrateProject(project));
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="New project">
        <div className="modal-header">
          <h2>New project</h2>
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <button type="button" className="secondary-action full-width" onClick={chooseImage}>
          {sourcePath ? fileNameFromPath(sourcePath) : "Choose image"}
        </button>

        <label>
          <span>Project name</span>
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
        </label>

        <label>
          <span>Document type</span>
          <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="choice-group">
          <legend>Source storage</legend>
          {SOURCE_MODE_OPTIONS.map((option) => (
            <label className="choice" key={option.id}>
              <input
                type="radio"
                name="sourceMode"
                checked={sourceMode === option.id}
                onChange={() => setSourceMode(option.id)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.detail}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-action" disabled={!sourcePath || busy} onClick={createProject}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
