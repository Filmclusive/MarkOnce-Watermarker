use base64::{Engine as _, engine::general_purpose};
use std::fs;
use std::path::Path;
use std::process::Command;

use super::hash::hash_file_path;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WrittenExport {
    path: String,
    hash: String,
    size: u64,
}

#[tauri::command]
pub fn write_export_file(path: String, data_url: String) -> Result<WrittenExport, String> {
    let bytes = decode_data_url(&data_url)?;
    let target = Path::new(&path);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(target, bytes).map_err(|error| error.to_string())?;
    let metadata = fs::metadata(target).map_err(|error| error.to_string())?;
    let hash = hash_file_path(target)?;
    Ok(WrittenExport {
        path,
        hash,
        size: metadata.len(),
    })
}

#[tauri::command]
pub fn open_path(path: String) -> Result<(), String> {
    open_target(Path::new(&path), false)
}

#[tauri::command]
pub fn show_in_folder(path: String) -> Result<(), String> {
    open_target(Path::new(&path), true)
}

fn decode_data_url(data_url: &str) -> Result<Vec<u8>, String> {
    let payload = data_url
        .split_once(',')
        .map(|(_, value)| value)
        .unwrap_or(data_url);
    general_purpose::STANDARD
        .decode(payload)
        .map_err(|error| error.to_string())
}

fn open_target(path: &Path, reveal: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("open");
        if reveal {
            command.arg("-R");
        }
        return command
            .arg(path)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string());
    }

    #[cfg(target_os = "windows")]
    {
        if reveal {
            let selector = format!("/select,{}", path.to_string_lossy());
            return Command::new("explorer")
                .arg(selector)
                .spawn()
                .map(|_| ())
                .map_err(|error| error.to_string());
        }
        return Command::new("cmd")
            .args(["/C", "start", ""])
            .arg(path)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string());
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        let target = if reveal {
            path.parent().unwrap_or(path)
        } else {
            path
        };
        Command::new("xdg-open")
            .arg(target)
            .spawn()
            .map(|_| ())
            .map_err(|error| error.to_string())
    }
}
