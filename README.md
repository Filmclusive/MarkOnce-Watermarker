
# MarkOnce

MarkOnce is a cross-platform desktop app for creating one-time-use watermarked copies of sensitive image documents.

It is built for local use:

- No account.
- No uploads.
- No analytics.
- No remote fonts or CDN assets.
- Portable project folders with readable `project.json` files.

<img width="1230" height="813" alt="Screenshot 2026-05-31 at 4 35 44 PM" src="https://github.com/user-attachments/assets/ce26895f-99f4-44be-bb47-ca1294ec5f41" />


<img width="1242" height="802" alt="Screenshot 2026-05-31 at 4 36 25 PM" src="https://github.com/user-attachments/assets/253441b3-d14e-4959-9ce5-dc970f1c5b41" />


## How To Use

1. Create a new project (or open an existing one).
2. Import an image (PNG, HEIC, JPG/JPEG, or WebP).
3. Rotate/crop as needed.
4. Choose a watermark template and tune opacity/rotation/size/spacing/color.
5. Add safe zones to reduce watermark strength over sensitive areas (optional).
6. Export a flattened copy (PNG, JPG, or PDF).

Projects are stored as folders you can move or back up. Each project includes a human-readable `project.json`.

## Product Truth

Watermarks discourage reuse and create context. They do not fully prevent editing, AI cleanup, manual copying, fraud, or misuse by a malicious recipient.

## Current v0.1 Scope

- Import PNG, JPG/JPEG, and WebP images.
- Local preview with rotate + crop.
- Repeated text watermarks from templates.
- Manual safe zones.
- Export flattened PNG, JPG, and PDF files.
- Local project save/reopen.
- Export history with source/export hashes.
- Project + history deletion.

HEIC is intentionally not supported in v0.1.

## Development (Mac / Windows / Linux)

```sh
npm install
npm --workspace apps/desktop run dev
npm --workspace apps/desktop run tauri dev
```

The Vite URL is useful for UI smoke testing. Native file dialogs and local file commands require the Tauri desktop shell.

## A DMG installer is already available

If you're not tech savvy, you can just use the DMG and use it like a regular app. 

## Build A macOS `.dmg`

On macOS, Tauri produces a `.dmg` bundle by default.

```sh
npm install
npm run tauri:build
```

Find artifacts under:

- `apps/desktop/src-tauri/target/release/bundle/dmg/`
- `apps/desktop/src-tauri/target/release/bundle/macos/`

### Signing / Notarization (optional)

If you plan to distribute outside your own machine, you typically need Apple code signing + notarization. MarkOnce does not include a built-in release pipeline yet—wire this up via Tauri’s signing/notarization guidance for your Tauri version.

## Verification

Scoped checks used during implementation:

```sh
npm --workspace apps/desktop run build
cargo check --manifest-path 'apps/desktop/src-tauri/Cargo.toml'
```
