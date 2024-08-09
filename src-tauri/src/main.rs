#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Builder;

// Declare the `commands` module
mod commands;

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![commands::list_files_in_directory, commands::get_parent_directory, commands::get_directory_hierarchy, commands::get_home_directory, commands::list_drives])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}