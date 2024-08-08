use serde::Serialize;
use std::fs;
use std::path::{PathBuf, Path};
use tauri::command;

#[derive(Debug, Serialize)]
pub struct FileInfo {
    path: String,
    is_dir: bool,
    is_video: bool,
    name: String,
}

#[command]
pub fn list_home_files() -> Result<Vec<FileInfo>, String> {
    list_files_in_directory(dirs::home_dir().ok_or("Could not retrieve home directory")?)
}

#[command]
pub fn list_files_in_directory(path: PathBuf) -> Result<Vec<FileInfo>, String> {
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
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

#[command]
pub fn get_parent_directory(path: PathBuf) -> Result<String, String> {
    match path.parent() {
        Some(parent) => match parent.to_str() {
            Some(parent_str) => Ok(parent_str.to_string()),
            None => Err("Could not convert parent directory to string".to_string()),
        },
        None => Err("No parent directory found".to_string()),
    }
}

fn is_video_file(path: &Path) -> bool {
    if let Some(extension) = path.extension() {
        match extension.to_str().unwrap_or("").to_lowercase().as_str() {
            "mp4" | "mkv" | "avi" | "mov" | "wmv" | "flv" | "webm" | "m4v" => true,
            _ => false,
        }
    } else {
        false
    }
}