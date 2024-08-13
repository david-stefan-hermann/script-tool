use std::fs;
use std::path::{Path, PathBuf};
use std::ffi::OsStr;
use std::io::{self, ErrorKind};
use crate::file_explorer::is_video_file; // Import from file_explorer.rs
use tauri::command;
use std::sync::{Arc, Mutex};
use crate::file_explorer::FileExplorer;

#[command]
pub fn rename_files_in_directory(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
    target_str: String,
    replacement_str: String,
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    rename_media_files_in_directory(&current_path, &target_str, &replacement_str)
        .map_err(|e| format!("Failed to rename files: {:?}", e))
}

#[derive(Debug)]
pub enum RenameError {
    IoError(io::Error),
    InvalidFilename,
}

impl From<io::Error> for RenameError {
    fn from(error: io::Error) -> Self {
        RenameError::IoError(error)
    }
}

pub fn rename_media_files_in_directory(
    directory: &Path,
    target_str: &str,
    replacement_str: &str,
) -> Result<(), RenameError> {
    let entries = fs::read_dir(directory)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {  // Use the existing function
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                let new_file_name = file_name.replace(target_str, replacement_str);
                if new_file_name != file_name {
                    let new_path = path.with_file_name(new_file_name);
                    fs::rename(&path, new_path)?;
                }
            } else {
                return Err(RenameError::InvalidFilename);
            }
        }
    }
    Ok(())
}
