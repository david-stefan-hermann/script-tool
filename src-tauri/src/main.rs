#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_explorer;

use file_explorer::{
    change_directory, get_current_path, get_directory_hierarchy, go_to_parent_directory,
    list_drives, list_files_in_current_directory, FileExplorer, list_files_in_home_directory,
};
use std::sync::{Arc, Mutex};
use tauri::{generate_handler, Builder};

fn main() {
    let explorer = Arc::new(Mutex::new(FileExplorer::new()));

    Builder::default()
        .manage(explorer)
        .invoke_handler(generate_handler![
            list_files_in_current_directory,
            change_directory,
            go_to_parent_directory,
            get_current_path,
            get_directory_hierarchy,
            list_drives,
            list_files_in_home_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
