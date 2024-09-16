use dirs;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};
use tauri::api::dialog::blocking::FileDialogBuilder;
use tauri::command;
use tauri::AppHandle;
use tauri::Manager;

#[derive(Debug, Serialize)]
pub struct FileInfo {
    path: String,
    is_dir: bool,
    is_video: bool,
    name: String,
}

#[derive(Debug)]
pub struct FileExplorer {
    current_path: PathBuf,
    app_handle: tauri::AppHandle,
}

#[derive(Serialize)]
pub struct DirectoryHierarchy {
    full_path: String,
    dir_name: String,
}

impl FileExplorer {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            current_path: dirs::home_dir().unwrap_or_else(|| PathBuf::from("/")),
            app_handle,
        }
    }

    pub fn list_files(&self) -> Result<Vec<FileInfo>, String> {
        let entries = fs::read_dir(&self.current_path).map_err(|e| e.to_string())?;
        let mut files = Vec::new();
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let is_dir = path.is_dir();
            if let Some(path_str) = path.to_str() {
                let name = path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let is_video = is_video_file(&path);
                files.push(FileInfo {
                    path: path_str.to_string(),
                    is_dir,
                    is_video,
                    name,
                });
            }
        }
        Ok(files)
    }

    pub fn change_directory(&mut self, path: PathBuf) -> Result<(), String> {
        if path.is_dir() {
            self.current_path = path;

            // Emit event
            self.app_handle
                .emit_all(
                    "directory-changed",
                    Some(self.current_path.to_string_lossy().to_string()),
                )
                .map_err(|e| e.to_string())?;

            Ok(())
        } else {
            Err("Path is not a directory".to_string())
        }
    }

    pub fn go_to_parent_directory(&mut self) -> Result<(), String> {
        if let Some(parent) = self.current_path.parent() {
            self.current_path = parent.to_path_buf();

            // Emit event
            self.app_handle
                .emit_all(
                    "directory-changed",
                    Some(self.current_path.to_string_lossy().to_string()),
                )
                .map_err(|e| e.to_string())?;

            Ok(())
        } else {
            Err("No parent directory found".to_string())
        }
    }

    pub fn get_current_path(&self) -> String {
        self.current_path.to_str().unwrap_or("").to_string()
    }

    pub fn get_directory_hierarchy(&self) -> Result<Vec<DirectoryHierarchy>, String> {
        let mut path = self.current_path.clone();
        let mut hierarchy = Vec::new();

        while let Some(parent) = path.parent() {
            if let Some(dir_name) = path.file_name().and_then(|name| name.to_str()) {
                hierarchy.push(DirectoryHierarchy {
                    full_path: path.to_str().unwrap_or("").to_string(),
                    dir_name: dir_name.to_string(),
                });
            }
            path = parent.to_path_buf();
        }

        // Add the root directory if it exists
        if let Some(root) = path.to_str() {
            hierarchy.push(DirectoryHierarchy {
                full_path: root.to_string(),
                dir_name: root.to_string(),
            });
        }

        Ok(hierarchy)
    }

    pub fn list_files_in_home_directory(&mut self) -> Result<Vec<FileInfo>, String> {
        let home_dir = dirs::home_dir().ok_or("Failed to get home directory")?;
        self.current_path = home_dir.clone(); // Update the current path to home directory

        // Emit event
        self.app_handle
            .emit_all(
                "directory-changed",
                Some(self.current_path.to_string_lossy().to_string()),
            )
            .map_err(|e| e.to_string())?;

        let entries = fs::read_dir(&home_dir).map_err(|e| e.to_string())?;
        let mut files = Vec::new();
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let is_dir = path.is_dir();
            if let Some(path_str) = path.to_str() {
                let name = path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let is_video = is_video_file(&path);
                files.push(FileInfo {
                    path: path_str.to_string(),
                    is_dir,
                    is_video,
                    name,
                });
            }
        }

        Ok(files)
    }

    pub fn open_in_file_explorer(&self) -> Result<(), String> {
        Command::new("explorer")
            .arg(self.current_path.to_str().ok_or("Invalid path")?)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn select_and_set_current_path(&mut self) -> Result<(), String> {
        let selected_path = FileDialogBuilder::new()
            .pick_folder()
            .ok_or("No folder selected")?;

        self.current_path = selected_path;

        // Emit event
        self.app_handle
            .emit_all(
                "directory-changed",
                Some(self.current_path.to_string_lossy().to_string()),
            )
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn open_in_terminal(&self) -> Result<(), String> {
        Command::new("cmd")
            .arg("/C")
            .arg("start")
            .arg("cmd")
            .arg("/K")
            .arg("cd")
            .arg(self.current_path.to_str().ok_or("Invalid path")?)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}

pub fn is_video_file(path: &Path) -> bool {
    if let Some(extension) = path.extension() {
        match extension.to_str().unwrap_or("").to_lowercase().as_str() {
            "mp4" | "mkv" | "avi" | "mov" | "wmv" | "flv" | "webm" | "m4v" => true,
            _ => false,
        }
    } else {
        false
    }
}

#[command]
pub fn list_files_in_current_directory(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<Vec<FileInfo>, String> {
    let explorer = state.lock().unwrap();
    explorer.list_files()
}

#[command]
pub fn change_directory(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
    path: String,
) -> Result<(), String> {
    let mut explorer = state.lock().unwrap();
    explorer.change_directory(PathBuf::from(path))
}

#[command]
pub fn go_to_parent_directory(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<(), String> {
    let mut explorer = state.lock().unwrap();
    explorer.go_to_parent_directory()
}

#[command]
pub fn get_current_path(state: tauri::State<'_, Arc<Mutex<FileExplorer>>>) -> String {
    let explorer = state.lock().unwrap();
    explorer.get_current_path()
}

#[command]
pub fn get_directory_hierarchy(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<Vec<DirectoryHierarchy>, String> {
    let explorer = state.lock().unwrap();
    explorer.get_directory_hierarchy()
}

#[command]
pub fn open_in_file_explorer(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    explorer.open_in_file_explorer()
}

#[command]
pub fn select_and_set_current_path(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<(), String> {
    let mut explorer = state.lock().unwrap();
    explorer.select_and_set_current_path()
}

#[command]
pub fn open_in_terminal(state: tauri::State<'_, Arc<Mutex<FileExplorer>>>) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    explorer.open_in_terminal()
}
