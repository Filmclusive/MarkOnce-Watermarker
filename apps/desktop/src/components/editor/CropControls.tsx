import type { ImageAdjustments } from "../../types/imageAdjustments";

interface CropControlsProps {
  adjustments: ImageAdjustments;
  mode: "view" | "crop" | "safe-zone";
  onModeChange: (mode: "view" | "crop" | "safe-zone") => void;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
}

export function CropControls({ adjustments, mode, onModeChange, onAdjustmentsChange }: CropControlsProps) {
  function rotate(delta: number) {
    onAdjustmentsChange({
      ...adjustments,
      rotationDegrees: (adjustments.rotationDegrees + delta + 360) % 360
    });
  }

  function resetCrop() {
    onAdjustmentsChange({
      ...adjustments,
      cropX: 0,
      cropY: 0,
      cropWidth: adjustments.originalWidth,
      cropHeight: adjustments.originalHeight
    });
  }

  function resetRotation() {
    onAdjustmentsChange({ ...adjustments, rotationDegrees: 0 });
  }

  return (
    <section className="control-group">
      <h2>Image</h2>
      <div className="segmented">
        <button type="button" className={mode === "view" ? "active" : ""} onClick={() => onModeChange("view")}>
          View
        </button>
        <button type="button" className={mode === "crop" ? "active" : ""} onClick={() => onModeChange("crop")}>
          Crop
        </button>
        <button type="button" className={mode === "safe-zone" ? "active" : ""} onClick={() => onModeChange("safe-zone")}>
          Safe zone
        </button>
      </div>
      <div className="button-grid">
        <button type="button" onClick={() => rotate(-90)}>
          Rotate left
        </button>
        <button type="button" onClick={() => rotate(90)}>
          Rotate right
        </button>
        <button type="button" onClick={resetRotation}>
          Reset rotation
        </button>
        <button type="button" onClick={resetCrop}>
          Reset crop
        </button>
      </div>
    </section>
  );
}
