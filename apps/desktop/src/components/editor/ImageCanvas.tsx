import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampRectToBounds,
  getRotatedSize,
  mapOutputPointToOriginal,
  normalizeCrop,
  rectFromPoints,
  safeZoneToOutputRect,
  type Rect
} from "../../lib/image/geometry";
import { renderFlattenedImage } from "../../lib/image/renderFlattenedImage";
import type { ImageAdjustments } from "../../types/imageAdjustments";
import type { LocalWatermarkerProject } from "../../types/project";
import type { SafeZone } from "../../types/watermark";

type InteractionMode = "view" | "crop" | "safe-zone";
type DragState =
  | { type: "crop"; start: { x: number; y: number }; current: { x: number; y: number } }
  | { type: "draw-zone"; id: string; start: { x: number; y: number }; current: { x: number; y: number } }
  | { type: "move-zone" | "resize-zone"; id: string; start: { x: number; y: number }; original: SafeZone };

interface ImageCanvasProps {
  image: HTMLImageElement;
  project: LocalWatermarkerProject;
  includeWatermark: boolean;
  interactionMode: InteractionMode;
  zoom: number;
  selectedSafeZoneId: string;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  onSafeZonesChange: (safeZones: SafeZone[]) => void;
  onSelectedSafeZoneChange: (safeZoneId: string) => void;
}

export function ImageCanvas({
  image,
  project,
  includeWatermark,
  interactionMode,
  zoom,
  selectedSafeZoneId,
  onAdjustmentsChange,
  onSafeZonesChange,
  onSelectedSafeZoneChange
}: ImageCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState(900);
  const [drag, setDrag] = useState<DragState | null>(null);
  const crop = useMemo(() => normalizeCrop(project.imageAdjustments), [project.imageAdjustments]);
  const outputSize = useMemo(
    () => getRotatedSize(crop, project.imageAdjustments.rotationDegrees),
    [crop, project.imageAdjustments.rotationDegrees]
  );
  const baseScale = Math.min(1, Math.max(0.08, (wrapperWidth - 16) / outputSize.width));
  const displayScale = Math.max(0.05, baseScale * zoom);
  const displayWidth = Math.max(1, Math.round(outputSize.width * displayScale));
  const displayHeight = Math.max(1, Math.round(outputSize.height * displayScale));

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => setWrapperWidth(entry.contentRect.width));
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fullCanvas = renderFlattenedImage(image, project, { includeWatermark });
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, displayWidth, displayHeight);
    context.imageSmoothingQuality = "high";
    context.drawImage(fullCanvas, 0, 0, displayWidth, displayHeight);
  }, [image, project, includeWatermark, displayWidth, displayHeight]);

  function pointerToOriginal(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const outputX = (event.clientX - rect.left) / displayScale;
    const outputY = (event.clientY - rect.top) / displayScale;
    return mapOutputPointToOriginal(outputX, outputY, crop, project.imageAdjustments.rotationDegrees);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (interactionMode === "view") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerToOriginal(event);

    if (interactionMode === "crop") {
      setDrag({ type: "crop", start: point, current: point });
      return;
    }

    const hit = hitSafeZone(event);
    if (hit) {
      onSelectedSafeZoneChange(hit.zone.safeZoneId);
      setDrag({ type: hit.resize ? "resize-zone" : "move-zone", id: hit.zone.safeZoneId, start: point, original: hit.zone });
      return;
    }

    const id = crypto.randomUUID();
    const zone = makeSafeZone(id, point, point);
    onSafeZonesChange([...project.safeZones, zone]);
    onSelectedSafeZoneChange(id);
    setDrag({ type: "draw-zone", id, start: point, current: point });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag) return;
    const point = pointerToOriginal(event);
    if (drag.type === "crop" || drag.type === "draw-zone") {
      setDrag({ ...drag, current: point });
    }
    if (drag.type === "draw-zone") {
      updateSafeZone(drag.id, makeSafeZone(drag.id, drag.start, point));
    }
    if (drag.type === "move-zone") {
      const dx = point.x - drag.start.x;
      const dy = point.y - drag.start.y;
      updateSafeZone(drag.id, clampRectToBounds({ ...drag.original, x: drag.original.x + dx, y: drag.original.y + dy }, crop));
    }
    if (drag.type === "resize-zone") {
      updateSafeZone(drag.id, clampRectToBounds({ ...drag.original, width: point.x - drag.original.x, height: point.y - drag.original.y }, crop));
    }
  }

  function handlePointerUp() {
    if (drag?.type === "crop") {
      const rect = clampRectToBounds(rectFromPoints(drag.start, drag.current), crop);
      if (rect.width > 8 && rect.height > 8) {
        onAdjustmentsChange({ ...project.imageAdjustments, cropX: rect.x, cropY: rect.y, cropWidth: rect.width, cropHeight: rect.height });
      }
    }
    setDrag(null);
  }

  function updateSafeZone(id: string, rect: Rect) {
    const next = project.safeZones.map((zone) =>
      zone.safeZoneId === id ? { ...zone, ...rect, opacityMultiplier: zone.opacityMultiplier } : zone
    );
    onSafeZonesChange(next);
  }

  function hitSafeZone(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvasRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    for (const zone of [...project.safeZones].reverse()) {
      const displayRect = zoneToDisplayRect(zone);
      if (!displayRect) continue;
      const inside =
        x >= displayRect.x &&
        x <= displayRect.x + displayRect.width &&
        y >= displayRect.y &&
        y <= displayRect.y + displayRect.height;
      if (inside) {
        const resize = displayRect.x + displayRect.width - x < 18 && displayRect.y + displayRect.height - y < 18;
        return { zone, resize };
      }
    }
    return null;
  }

  function zoneToDisplayRect(zone: SafeZone) {
    const outputRect = safeZoneToOutputRect(zone, crop, project.imageAdjustments.rotationDegrees);
    if (!outputRect) return null;
    return {
      x: outputRect.x * displayScale,
      y: outputRect.y * displayScale,
      width: outputRect.width * displayScale,
      height: outputRect.height * displayScale
    };
  }

  const draftCrop = drag?.type === "crop" ? rectToDisplayRect(rectFromPoints(drag.start, drag.current)) : null;

  return (
    <div className="canvas-wrap" ref={wrapperRef}>
      <div className="canvas-stage" style={{ width: displayWidth, height: displayHeight }}>
        <canvas
          ref={canvasRef}
          className={`image-canvas mode-${interactionMode}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        {project.safeZones.map((zone) => {
          const displayRect = zoneToDisplayRect(zone);
          if (!displayRect) return null;
          return (
            <div
              className={`safe-zone-box ${selectedSafeZoneId === zone.safeZoneId ? "selected" : ""}`}
              key={zone.safeZoneId}
              style={rectStyle(displayRect)}
            />
          );
        })}
        {draftCrop ? <div className="crop-box" style={rectStyle(draftCrop)} /> : null}
      </div>
    </div>
  );

  function rectToDisplayRect(rect: Rect) {
    const bounded = clampRectToBounds(rect, crop);
    const outputRect = safeZoneToOutputRect({ safeZoneId: "draft", opacityMultiplier: 1, ...bounded }, crop, project.imageAdjustments.rotationDegrees);
    if (!outputRect) return null;
    return {
      x: outputRect.x * displayScale,
      y: outputRect.y * displayScale,
      width: outputRect.width * displayScale,
      height: outputRect.height * displayScale
    };
  }
}

function makeSafeZone(id: string, a: { x: number; y: number }, b: { x: number; y: number }): SafeZone {
  return { safeZoneId: id, ...rectFromPoints(a, b), opacityMultiplier: 0.5 };
}

function rectStyle(rect: Rect) {
  return {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height
  };
}
