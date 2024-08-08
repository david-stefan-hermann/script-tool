use log::{error, info};
use std::fs;

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<String>, String> {
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
