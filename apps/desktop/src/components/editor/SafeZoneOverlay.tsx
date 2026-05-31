import type { SafeZone } from "../../types/watermark";

interface SafeZoneOverlayProps {
  safeZones: SafeZone[];
  selectedSafeZoneId: string;
  onSelectedSafeZoneChange: (id: string) => void;
  onSafeZonesChange: (safeZones: SafeZone[]) => void;
}

export function SafeZoneOverlay({
  safeZones,
  selectedSafeZoneId,
  onSelectedSafeZoneChange,
  onSafeZonesChange
}: SafeZoneOverlayProps) {
  const selected = safeZones.find((zone) => zone.safeZoneId === selectedSafeZoneId);

  function deleteSelected() {
    if (!selectedSafeZoneId) return;
    onSafeZonesChange(safeZones.filter((zone) => zone.safeZoneId !== selectedSafeZoneId));
    onSelectedSafeZoneChange("");
  }

  return (
    <section className="control-group">
      <div className="section-header tight">
        <h2>Safe zones</h2>
        <span>{safeZones.length}</span>
      </div>
      <p className="muted small-text">Draw rectangles to soften watermark opacity over critical fields.</p>
      {selected ? <p className="muted small-text">Selected zone opacity is reduced by 50 percent.</p> : null}
      <button type="button" onClick={deleteSelected} disabled={!selected}>
        Delete selected zone
      </button>
    </section>
  );
}
