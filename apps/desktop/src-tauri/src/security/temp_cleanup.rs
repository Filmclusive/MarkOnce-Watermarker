use std::fs;
use tauri::{AppHandle, Manager};

pub fn clear_temp_files(app: &AppHandle) -> Result<(), String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|error| error.to_string())?;
    let temp_dir = cache_dir.join("render-temp");
    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir).map_err(|error| error.to_string())?;
    }
    fs::create_dir_all(temp_dir).map_err(|error| error.to_string())
}
