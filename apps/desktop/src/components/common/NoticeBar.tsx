import type { AppNotice } from "../../types/runtime";

interface NoticeBarProps {
  notice: AppNotice | null;
  onDismiss: () => void;
}

export function NoticeBar({ notice, onDismiss }: NoticeBarProps) {
  if (!notice) return null;

  return (
    <div className={`notice notice-${notice.tone}`} role="status">
      <span>{notice.message}</span>
      <button type="button" className="icon-button" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
