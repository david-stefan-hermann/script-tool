use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct FileInfo {
    path: String,
    is_dir: bool,
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
            let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
            files.push(FileInfo {
                path: path_str.to_string(),
                is_dir,
                name
            });
        }
    }
    Ok(files)
}
