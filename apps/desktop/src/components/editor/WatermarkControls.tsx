import { DEFAULT_TEMPLATES } from "../../lib/templates/defaultTemplates";
import { applyPreset, WATERMARK_PRESETS } from "../../lib/watermark/getWatermarkPreset";
import type { WatermarkSettings, WatermarkPresetId } from "../../types/watermark";

interface WatermarkControlsProps {
  settings: WatermarkSettings;
  onChange: (settings: WatermarkSettings) => void;
}

export function WatermarkControls({ settings, onChange }: WatermarkControlsProps) {
  function update<K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) {
    onChange({ ...settings, [key]: value, preset: shouldMarkCustom(key) ? "custom" : settings.preset });
  }

  function selectPreset(preset: WatermarkPresetId) {
    onChange(applyPreset(settings, preset));
  }

  return (
    <section className="control-group">
      <h2>Watermark</h2>
      <label>
        <span>Recipient</span>
        <input value={settings.recipient} onChange={(event) => update("recipient", event.target.value)} />
      </label>
      <label>
        <span>Purpose</span>
        <input value={settings.purpose} onChange={(event) => update("purpose", event.target.value)} />
      </label>
      <label>
        <span>Date</span>
        <input type="date" value={settings.date} onChange={(event) => update("date", event.target.value)} />
      </label>
      <label>
        <span>Template</span>
        <select value={settings.templateId} onChange={(event) => update("templateId", event.target.value)}>
          {DEFAULT_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </label>
      {settings.templateId === "custom" ? (
        <label>
          <span>Custom text</span>
          <textarea value={settings.customText} onChange={(event) => update("customText", event.target.value)} rows={5} />
        </label>
      ) : null}
      <div className="segmented">
        {[...WATERMARK_PRESETS, { id: "custom" as const, label: "Custom", purpose: "User settings" }].map((preset) => (
          <button
            type="button"
            className={settings.preset === preset.id ? "active" : ""}
            key={preset.id}
            title={preset.purpose}
            onClick={() => selectPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <Slider label="Opacity" min={0.04} max={0.45} step={0.01} value={settings.opacity} onChange={(value) => update("opacity", value)} />
      <Slider
        label="Rotation"
        min={-75}
        max={75}
        step={1}
        value={settings.rotationDegrees}
        suffix="deg"
        onChange={(value) => update("rotationDegrees", value)}
      />
      <Slider label="Text size" min={12} max={96} step={1} value={settings.fontSize} onChange={(value) => update("fontSize", value)} />
      <Slider
        label="Horizontal spacing"
        min={120}
        max={620}
        step={10}
        value={settings.tileSpacingX}
        onChange={(value) => update("tileSpacingX", value)}
      />
      <Slider
        label="Vertical spacing"
        min={90}
        max={440}
        step={10}
        value={settings.tileSpacingY}
        onChange={(value) => update("tileSpacingY", value)}
      />
      <label>
        <span>Text color</span>
        <input type="color" value={settings.color} onChange={(event) => update("color", event.target.value)} />
      </label>
      <div className="resolved-text">
        <span>Preview text</span>
        <pre>{settings.resolvedText}</pre>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>
        {label} <small>{`${value}${suffix ?? ""}`}</small>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function shouldMarkCustom(key: keyof WatermarkSettings) {
  return ["opacity", "rotationDegrees", "fontSize", "tileSpacingX", "tileSpacingY", "color"].includes(key);
}
