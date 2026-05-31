mod commands;
mod security;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            security::temp_cleanup::clear_temp_files(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::projects::create_project_from_source,
            commands::projects::list_projects,
            commands::projects::open_project,
            commands::projects::save_project,
            commands::projects::delete_project,
            commands::projects::copy_source_into_project,
            commands::projects::project_export_path,
            commands::files::get_source_file_info,
            commands::files::read_image_data_url,
            commands::files::file_exists,
            commands::exports::write_export_file,
            commands::exports::open_path,
            commands::exports::show_in_folder,
            commands::hash::hash_file
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Local Watermarker");
}
