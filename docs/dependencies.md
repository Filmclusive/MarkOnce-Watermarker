# Dependency Notes

All application dependencies are pinned in `apps/desktop/package.json` and `apps/desktop/src-tauri/Cargo.toml`.

## Frontend

- React: UI rendering.
- Vite: local development server and production bundling.
- TypeScript: source language.
- Tauri JavaScript API: native bridge.
- Tauri dialog plugin: OS-native open/save dialogs.
- Tauri opener plugin: open exported files or their containing folders.
- jsPDF: local single-page PDF export. It is lazy-loaded only when exporting PDF.
- esbuild: Vite production transpilation backend.

## Backend

- Tauri: desktop shell and command bridge.
- serde and serde_json: readable project JSON.
- sha2: local SHA-256 file hashing.
- uuid: project IDs.
- base64: data URL decoding for export writes.
- mime_guess: image data URL MIME detection.
- time: stable timestamp formatting.

## Network Posture

The app code does not call external APIs, load remote fonts, use analytics, or use CDN assets.

`npm install` and Cargo dependency resolution require network access during development unless dependencies are already cached.
