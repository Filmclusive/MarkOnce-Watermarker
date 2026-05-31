# Privacy

Local Watermarker is designed for offline desktop use.

## What Stays Local

- Source image path and metadata.
- Optional copied source image.
- Project settings.
- Safe zones.
- Export history.
- Export receipts if a later version enables them.

## What Is Not Sent

- Documents are not uploaded.
- No account data is collected.
- No analytics are sent.
- No external APIs are called by the app.
- No remote fonts or CDN assets are loaded.

## Source Storage Modes

Reference-only mode stores the original file path and hash. It is more private, but the project may need reconnecting if the file moves.

Copied-source mode copies the sensitive source image into the local project folder. It is easier to reuse, but it stores another local copy of the document.

## Limits

Watermarks are a deterrent and context marker. They do not prevent determined editing, AI cleanup, manual copying, or misuse on a compromised computer.
