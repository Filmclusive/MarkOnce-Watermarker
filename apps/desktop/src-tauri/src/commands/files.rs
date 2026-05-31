use base64::{Engine as _, engine::general_purpose};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::UNIX_EPOCH;
use tauri::{AppHandle, Manager};

use super::hash::hash_file_path;
use super::projects::metadata_time_to_string;
use sha2::{Digest, Sha256};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceFileInfo {
    pub file_name: String,
    pub file_type: String,
    pub file_hash: String,
    pub file_size: u64,
    pub last_modified_at: String,
}

#[tauri::command]
pub fn get_source_file_info(app: AppHandle, path: String) -> Result<SourceFileInfo, String> {
    let source = Path::new(&path);
    ensure_readable_image(&app, source)?;
    source_file_info(source)
}

#[tauri::command]
pub fn read_image_data_url(app: AppHandle, path: String) -> Result<String, String> {
    let source = Path::new(&path);
    reject_unsupported_image(source)?;
    let (read_path, mime) = readable_image_path(&app, source)?;
    let bytes = fs::read(read_path).map_err(|error| error.to_string())?;
    let encoded = general_purpose::STANDARD.encode(bytes);
    Ok(format!("data:{};base64,{}", mime, encoded))
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    Path::new(&path).is_file()
}

pub fn source_file_info(path: &Path) -> Result<SourceFileInfo, String> {
    reject_unsupported_image(path)?;
    let metadata = fs::metadata(path).map_err(|error| error.to_string())?;
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("source-image")
        .to_string();
    let file_type = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_lowercase();

    Ok(SourceFileInfo {
        file_name,
        file_type,
        file_hash: hash_file_path(path)?,
        file_size: metadata.len(),
        last_modified_at: metadata_time_to_string(metadata.modified().ok()),
    })
}

pub fn reject_unsupported_image(path: &Path) -> Result<(), String> {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "png" | "jpg" | "jpeg" | "webp" | "heic" | "heif" => Ok(()),
        _ => Err("Choose a PNG, JPG, JPEG, WebP, HEIC, or HEIF image.".into()),
    }
}

pub fn ensure_readable_image(app: &AppHandle, source: &Path) -> Result<(), String> {
    reject_unsupported_image(source)?;
    readable_image_path(app, source).map(|_| ())
}

fn readable_image_path(app: &AppHandle, source: &Path) -> Result<(PathBuf, String), String> {
    if is_heic_image(source) {
        return Ok((convert_heic_to_jpeg(app, source)?, "image/jpeg".to_string()));
    }

    Ok((
        source.to_path_buf(),
        mime_guess::from_path(source)
            .first_or_octet_stream()
            .to_string(),
    ))
}

fn is_heic_image(path: &Path) -> bool {
    matches!(
        path.extension()
            .and_then(|value| value.to_str())
            .map(str::to_lowercase)
            .as_deref(),
        Some("heic" | "heif")
    )
}

fn convert_heic_to_jpeg(app: &AppHandle, source: &Path) -> Result<PathBuf, String> {
    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
        let _ = source;
        return Err(
            "HEIC and HEIF import requires native conversion support on this platform.".into(),
        );
    }

    #[cfg(target_os = "macos")]
    {
        let destination = heic_cache_path(app, source)?;
        if destination.is_file() {
            return Ok(destination);
        }

        let output = Command::new("sips")
            .args(["-s", "format", "jpeg"])
            .arg(source)
            .arg("--out")
            .arg(&destination)
            .output()
            .map_err(|error| format!("Could not convert HEIC to JPEG: {error}"))?;

        if !output.status.success() {
            let detail = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let message = if detail.is_empty() {
                "Could not convert HEIC to JPEG.".to_string()
            } else {
                format!("Could not convert HEIC to JPEG: {detail}")
            };
            return Err(message);
        }

        if !destination.is_file() {
            return Err("Could not convert HEIC to JPEG.".into());
        }

        Ok(destination)
    }
}

fn heic_cache_path(app: &AppHandle, source: &Path) -> Result<PathBuf, String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|error| error.to_string())?
        .join("render-temp")
        .join("heic");
    fs::create_dir_all(&cache_dir).map_err(|error| error.to_string())?;
    Ok(cache_dir.join(format!("{}.jpg", image_cache_key(source)?)))
}

fn image_cache_key(source: &Path) -> Result<String, String> {
    let metadata = fs::metadata(source).map_err(|error| error.to_string())?;
    let modified = metadata
        .modified()
        .ok()
        .and_then(|value| value.duration_since(UNIX_EPOCH).ok())
        .map(|value| format!("{}-{}", value.as_secs(), value.subsec_nanos()))
        .unwrap_or_default();
    let mut hasher = Sha256::new();
    hasher.update(source.to_string_lossy().as_bytes());
    hasher.update([0_u8]);
    hasher.update(metadata.len().to_string().as_bytes());
    hasher.update([0_u8]);
    hasher.update(modified.as_bytes());
    Ok(hasher
        .finalize()
        .iter()
        .map(|byte| format!("{:02x}", byte))
        .collect::<String>())
}
