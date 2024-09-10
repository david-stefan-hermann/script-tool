#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod anime_episodes;
mod file_explorer;
mod file_operations;

use anime_episodes::fetch_anime_episode_titles_grouped_by_season;
use file_explorer::{
    change_directory, get_current_path, get_directory_hierarchy, go_to_parent_directory,
    list_drives, list_files_in_current_directory, list_files_in_home_directory, FileExplorer,
};
use file_operations::{
    adjust_episode_numbers_in_directory, get_current_episode_names, rename_episodes_with_titles,
    rename_files_in_directory,
};

use std::sync::{Arc, Mutex};
use tauri::{generate_handler, Builder, Manager, WindowBuilder, WindowUrl, AppHandle};

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
            fetch_anime_episode_titles_grouped_by_season,
            open_episode_title_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn open_episode_title_window(app: AppHandle) {
    let _new_window = WindowBuilder::new(
        &app,
        "episode_fetcher",   // Unique label for the new window
        WindowUrl::App("/episode-fetcher".into())  // Load Next.js route
    )
    .title("Episoden Titel laden")
    .inner_size(600.0, 800.0) // Set window size
    .resizable(true) // Make the window non-resizable if you prefer
    .build()
    .unwrap();  // Handle possible errors here
}
