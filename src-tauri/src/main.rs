#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod explorer;
mod api;
mod utils;

use api::anime_episodes_jikan::fetch_jikan_show_details;
use api::anime_episodes_thetvdb::fetch_tvdb_episode_titles_grouped_by_season;
use api::anime_episodes_tvmaze::fetch_tvmaze_show_details;
use explorer::file_explorer::{
    change_directory, get_current_path, get_directory_hierarchy, go_to_parent_directory,
    list_drives, list_files_in_current_directory, list_files_in_home_directory, FileExplorer,
};
use explorer::file_operations::{
    adjust_episode_numbers_in_directory, get_current_episode_names, 
    add_titles_to_episodes, add_titles_to_episodes_preview,
    search_and_replace,
};
use utils::utils::{trigger_refresh, open_episode_title_window, focus_main_window};

use std::sync::{Arc, Mutex};
use tauri::{ generate_handler, Builder, Manager};

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
            adjust_episode_numbers_in_directory,
            get_current_episode_names,
            fetch_jikan_show_details,
            fetch_tvdb_episode_titles_grouped_by_season,
            fetch_tvmaze_show_details,
            open_episode_title_window,
            focus_main_window,
            add_titles_to_episodes,
            add_titles_to_episodes_preview,
            search_and_replace,
            trigger_refresh
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
