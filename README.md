# Local Watermarker

Local Watermarker is a cross-platform desktop app for creating one-time-use watermarked copies of sensitive image documents.

It is built for local use:

- No account.
- No uploads.
- No analytics.
- No remote fonts or CDN assets.
- Portable project folders with readable `project.json` files.

## Current v0.1 Scope

- Import PNG, JPG, JPEG, and WebP images.
- Show a local image preview.
- Rotate and crop the source image.
- Add repeated text watermarks from templates.
- Adjust opacity, rotation, text size, spacing, and color.
- Add manual safe zones where watermark opacity is reduced.
- Export flattened PNG, JPG, and PDF files.
- Save projects locally.
- Reopen projects.
- Track export history with source/export hashes.
- Delete projects and export history items.

HEIC is intentionally not supported in v0.1.

## Product Truth

Watermarks discourage reuse and create context. They do not fully prevent editing, AI cleanup, manual copying, fraud, or misuse by a malicious recipient.

## Development

```sh
npm install
npm --workspace apps/desktop run dev
npm --workspace apps/desktop run tauri dev
```

The Vite URL is useful for UI smoke testing. Native file dialogs and local file commands require the Tauri desktop shell.

## Verification

Scoped checks used during implementation:

```sh
npm --workspace apps/desktop run build
cargo check --manifest-path 'apps/desktop/src-tauri/Cargo.toml'
```
