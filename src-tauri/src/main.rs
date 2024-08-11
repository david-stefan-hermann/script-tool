#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Builder;

// Declare the `commands` module
mod file_explorer;

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![file_explorer::list_files_in_directory, file_explorer::get_parent_directory, file_explorer::get_directory_hierarchy, file_explorer::get_home_directory, file_explorer::list_drives])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}