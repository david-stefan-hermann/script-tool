#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use std::sync::{Arc, Mutex};
use tauri::api::dialog::FileDialogBuilder;
use tauri::Builder;
use log::{info, error};

#[tauri::command]
fn open_file_explorer() -> Result<String, String> {
    let path = Arc::new(Mutex::new(String::new()));
    let path_clone = Arc::clone(&path);

    FileDialogBuilder::new().pick_folder(move |folder_path| {
        if let Some(folder_path) = folder_path {
            let mut path = path_clone.lock().unwrap();
            *path = folder_path.to_str().unwrap().to_string();
            info!("Selected folder path: {}", *path);
        } else {
            error!("No folder selected");
        }
    });

    let path = path.lock().unwrap();
    if path.is_empty() {
        Err("No folder selected".to_string())
    } else {
        Ok(path.clone())
    }
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    match fs::read_dir(&path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        files.push(entry.file_name().into_string().unwrap());
                    }
                    Err(e) => {
                        error!("Error reading entry: {}", e);
                        return Err(format!("Error reading entry: {}", e));
                    }
                }
            }
            info!("Read directory: {}", path);
            Ok(files)
        }
        Err(e) => {
            error!("Failed to read directory: {}", e);
            Err(format!("Failed to read directory: {}", e))
        }
    }
}

fn main() {
    env_logger::init();

    Builder::default()
        .invoke_handler(tauri::generate_handler![open_file_explorer, read_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}