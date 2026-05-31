use serde_json::{Value, json};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};
use time::OffsetDateTime;
use time::format_description::well_known::Rfc3339;
use uuid::Uuid;

use super::files::{ensure_readable_image, reject_unsupported_image, source_file_info};

const PROJECTS_DIR: &str = "LocalWatermarkerProjects";

#[tauri::command]
pub fn create_project_from_source(
    app: AppHandle,
    source_path: String,
    source_mode: String,
    project_name: String,
    document_type: String,
) -> Result<Value, String> {
    let source = Path::new(&source_path);
    ensure_readable_image(&app, source)?;
    let info = source_file_info(source)?;
    let project_id = Uuid::new_v4().to_string();
    let project_dir = project_dir(&app, &project_id)?;
    fs::create_dir_all(project_dir.join("source")).map_err(|error| error.to_string())?;
    fs::create_dir_all(project_dir.join("exports")).map_err(|error| error.to_string())?;
    fs::create_dir_all(project_dir.join("receipts")).map_err(|error| error.to_string())?;

    let source_copied_path = if source_mode == "copy" {
        copy_source_to_project_dir(source, &project_dir)?
    } else {
        String::new()
    };

    let now = now_string();
    let project = json!({
      "projectId": project_id,
      "projectPath": project_dir.to_string_lossy(),
      "projectName": clean_project_name(&project_name, &info.file_name),
      "documentType": document_type,
      "createdAt": now,
      "updatedAt": now,
      "sourceMode": if source_mode == "copy" { "copy" } else { "reference" },
      "sourceOriginalPath": source_path,
      "sourceCopiedPath": source_copied_path,
      "sourceFileName": info.file_name,
      "sourceFileType": info.file_type,
      "sourceFileHash": info.file_hash,
      "sourceFileSize": info.file_size,
      "sourceLastModifiedAt": info.last_modified_at,
      "imageAdjustments": {
        "rotationDegrees": 0,
        "cropX": 0,
        "cropY": 0,
        "cropWidth": 0,
        "cropHeight": 0,
        "originalWidth": 0,
        "originalHeight": 0
      },
      "watermarkSettings": {
        "templateId": "recipient-purpose-date",
        "customText": "",
        "recipient": "",
        "purpose": "",
        "date": now[..10].to_string(),
        "resolvedText": "",
        "preset": "standard",
        "opacity": 0.2,
        "rotationDegrees": -30,
        "fontSize": 42,
        "fontFamily": "Verdana, Inter, sans-serif",
        "fontWeight": 600,
        "color": "#1f2937",
        "tileSpacingX": 280,
        "tileSpacingY": 190,
        "lineHeight": 1.24,
        "safeZoneOpacityMultiplier": 0.5
      },
      "safeZones": [],
      "exportHistory": [],
      "appVersion": "0.1.0"
    });

    write_project_json(&project_dir, &project)?;
    Ok(project)
}

#[tauri::command]
pub fn list_projects(app: AppHandle) -> Result<Vec<Value>, String> {
    let root = projects_root(&app)?;
    fs::create_dir_all(&root).map_err(|error| error.to_string())?;
    let mut projects = Vec::new();

    for entry in fs::read_dir(root).map_err(|error| error.to_string())? {
        let path = entry
            .map_err(|error| error.to_string())?
            .path()
            .join("project.json");
        if path.is_file() {
            if let Ok(project) = read_project_json(&path) {
                projects.push(project);
            }
        }
    }

    projects.sort_by(|a, b| {
        b.get("updatedAt")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .cmp(
                a.get("updatedAt")
                    .and_then(Value::as_str)
                    .unwrap_or_default(),
            )
    });
    Ok(projects)
}

#[tauri::command]
pub fn open_project(project_path: String) -> Result<Value, String> {
    let path = Path::new(&project_path);
    let json_path = if path.is_dir() {
        path.join("project.json")
    } else {
        path.to_path_buf()
    };
    read_project_json(&json_path)
}

#[tauri::command]
pub fn save_project(app: AppHandle, mut project: Value) -> Result<Value, String> {
    let project_id = project
        .get("projectId")
        .and_then(Value::as_str)
        .ok_or_else(|| "Project is missing an id.".to_string())?;
    let project_dir = project_dir(&app, project_id)?;
    fs::create_dir_all(&project_dir).map_err(|error| error.to_string())?;
    project["projectPath"] = json!(project_dir.to_string_lossy());
    project["updatedAt"] = json!(now_string());
    write_project_json(&project_dir, &project)?;
    Ok(project)
}

#[tauri::command]
pub fn delete_project(app: AppHandle, project_id: String) -> Result<(), String> {
    let dir = project_dir(&app, &project_id)?;
    if dir.exists() {
        fs::remove_dir_all(dir).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn copy_source_into_project(
    app: AppHandle,
    project_id: String,
    source_path: String,
) -> Result<String, String> {
    let source = Path::new(&source_path);
    ensure_readable_image(&app, source)?;
    let project_dir = project_dir(&app, &project_id)?;
    fs::create_dir_all(project_dir.join("source")).map_err(|error| error.to_string())?;
    copy_source_to_project_dir(source, &project_dir)
}

#[tauri::command]
pub fn project_export_path(
    app: AppHandle,
    project_id: String,
    file_name: String,
) -> Result<String, String> {
    let export_dir = project_dir(&app, &project_id)?.join("exports");
    fs::create_dir_all(&export_dir).map_err(|error| error.to_string())?;
    Ok(export_dir
        .join(sanitize_filename(&file_name))
        .to_string_lossy()
        .to_string())
}

pub fn projects_root(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    Ok(app_data.join(PROJECTS_DIR))
}

pub fn project_dir(app: &AppHandle, project_id: &str) -> Result<PathBuf, String> {
    Ok(projects_root(app)?.join(project_id))
}

pub fn now_string() -> String {
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".into())
}

pub fn metadata_time_to_string(time: Option<SystemTime>) -> String {
    let Some(time) = time else {
        return String::new();
    };
    let Ok(duration) = time.duration_since(UNIX_EPOCH) else {
        return String::new();
    };
    OffsetDateTime::from_unix_timestamp(duration.as_secs() as i64)
        .ok()
        .and_then(|value| value.format(&Rfc3339).ok())
        .unwrap_or_default()
}

fn read_project_json(path: &Path) -> Result<Value, String> {
    let data = fs::read_to_string(path).map_err(|error| error.to_string())?;
    serde_json::from_str(&data).map_err(|error| error.to_string())
}

fn write_project_json(project_dir: &Path, project: &Value) -> Result<(), String> {
    fs::create_dir_all(project_dir).map_err(|error| error.to_string())?;
    let json = serde_json::to_string_pretty(project).map_err(|error| error.to_string())?;
    fs::write(project_dir.join("project.json"), json).map_err(|error| error.to_string())
}

fn copy_source_to_project_dir(source: &Path, project_dir: &Path) -> Result<String, String> {
    reject_unsupported_image(source)?;
    let file_name = source
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("source-image");
    let destination = project_dir
        .join("source")
        .join(sanitize_filename(file_name));
    fs::copy(source, &destination).map_err(|error| error.to_string())?;
    Ok(destination.to_string_lossy().to_string())
}

fn clean_project_name(value: &str, fallback_file: &str) -> String {
    let trimmed = value.trim();
    if !trimmed.is_empty() {
        return trimmed.to_string();
    }
    fallback_file
        .split('.')
        .next()
        .unwrap_or("Watermarked document")
        .to_string()
}

fn sanitize_filename(value: &str) -> String {
    value
        .chars()
        .map(|character| match character {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '-',
            _ => character,
        })
        .collect()
}
