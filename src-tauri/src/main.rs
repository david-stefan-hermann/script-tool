#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_explorer;
mod file_operations;

use file_explorer::{
    change_directory, get_current_path, get_directory_hierarchy, go_to_parent_directory,
    list_drives, list_files_in_current_directory, FileExplorer, list_files_in_home_directory,
};
use file_operations::{rename_files_in_directory, adjust_episode_numbers_in_directory, rename_episodes_with_titles, get_current_episode_names};

use std::sync::{Arc, Mutex};
use tauri::{generate_handler, Builder, Manager};


fn main() {
    Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let explorer = Arc::new(Mutex::new(FileExplorer::new(app_handle)));

            app.manage(explorer);
            Ok(())
        })
        .invoke_handler(generate_handler![
            list_files_in_current_directory,
            change_directory,
            go_to_parent_directory,
            get_current_path,
            get_directory_hierarchy,
            list_drives,
            list_files_in_home_directory,
            rename_files_in_directory,
            adjust_episode_numbers_in_directory,
            rename_episodes_with_titles,
            get_current_episode_names,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}