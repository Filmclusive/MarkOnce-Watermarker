import { APP_COPY } from "../constants/app";
import { clearRecentFiles } from "../lib/runtime/settings";

interface SettingsProps {
  onRecentCleared: () => void;
}

export function Settings({ onRecentCleared }: SettingsProps) {
  function handleClearRecent() {
    clearRecentFiles();
    onRecentCleared();
  }

  return (
    <main className="page narrow-page">
      <section className="content-section">
        <h1>Settings</h1>
        <div className="settings-list">
          <div>
            <strong>Privacy</strong>
            <p>{APP_COPY.privacyNote}</p>
          </div>
          <div>
            <strong>Limitations</strong>
            <p>{APP_COPY.limitationNote}</p>
          </div>
          <div>
            <strong>Thumbnails</strong>
            <p>Sensitive thumbnails are hidden by default.</p>
          </div>
        </div>
        <button type="button" className="secondary-action" onClick={handleClearRecent}>
          Clear recent files
        </button>
      </section>
    </main>
  );
}
