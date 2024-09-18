#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod explorer;
mod utils;

use api::anime_episodes_jikan::fetch_jikan_show_details;
use api::anime_episodes_thetvdb::fetch_tvdb_episode_titles_grouped_by_season;
use api::anime_episodes_tvmaze::fetch_tvmaze_show_details;
use explorer::file_explorer::{
    change_directory, get_current_path, get_directory_hierarchy, go_to_parent_directory,
    list_files_in_current_directory, open_in_file_explorer, open_in_terminal,
    select_and_set_current_path, FileExplorer,
};
use explorer::file_operations::{
    add_titles_to_episodes, add_titles_to_episodes_preview, adjust_episode_numbers,
    adjust_episode_numbers_preview, flatten_single_file_directories, get_current_episode_names,
    organize_videos_into_directories, search_and_replace, search_and_replace_preview,
};
use explorer::printer::{print_file_sizes, print_media_files_in_directories};
use explorer::utils::{list_drives, list_files_in_home_directory};
use tokio::sync::Mutex as AsyncMutex;
use tokio_util::sync::CancellationToken;
use utils::qr_code_generator::{generate_qr_code, save_qr_code_as_png, save_qr_code_as_svg};
use utils::utils::{focus_main_window, open_episode_title_window, trigger_refresh};

use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use tauri::{generate_handler, Builder, Manager};

#[derive(Default)]
pub struct AppState {
    cancellation_token: Option<CancellationToken>,
}

#[derive(Default)]
struct WindowState {
    sent_windows: HashSet<String>,
}

fn main() {
    Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let explorer = Arc::new(Mutex::new(FileExplorer::new(app_handle)));
            let app_state = Arc::new(AsyncMutex::new(AppState::default()));
            let window_state = Arc::new(Mutex::new(WindowState::default()));

            app.manage(explorer);
            app.manage(app_state);
            app.manage(window_state);

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
            open_in_file_explorer,
            open_in_terminal,
            select_and_set_current_path,
            add_titles_to_episodes,
            add_titles_to_episodes_preview,
            adjust_episode_numbers,
            adjust_episode_numbers_preview,
            flatten_single_file_directories,
            get_current_episode_names,
            organize_videos_into_directories,
            search_and_replace,
            search_and_replace_preview,
            generate_qr_code,
            save_qr_code_as_png,
            save_qr_code_as_svg,
            focus_main_window,
            open_episode_title_window,
            trigger_refresh,
            print_media_files_in_directories,
            fetch_jikan_show_details,
            fetch_tvdb_episode_titles_grouped_by_season,
            fetch_tvmaze_show_details,
            print_file_sizes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
