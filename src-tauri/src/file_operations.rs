use crate::file_explorer::{is_video_file, FileExplorer}; // Import necessary items
use regex::Regex;
use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{command, State, Window};

#[command]
pub fn rename_files_in_directory(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    target_str: String,
    replacement_str: String,
    window: Window, // Add the window parameter to emit events
) -> Result<(), String> {
    if target_str.is_empty() {
        return Err("Target string cannot be empty.".to_string());
    }

    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    rename_media_files_in_directory(&current_path, &target_str, &replacement_str)
        .map_err(|e| format!("Failed to rename files: {:?}", e))?;

    // Emit an event when renaming is successful
    window
        .emit("trigger-reload", "Files renamed successfully")
        .unwrap();

    Ok(())
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

impl std::fmt::Display for RenameError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RenameError::IoError(e) => write!(f, "IO Error: {}", e),
            RenameError::InvalidFilename => write!(f, "Invalid Filename"),
        }
    }
}

impl std::error::Error for RenameError {}

pub fn rename_media_files_in_directory(
    directory: &Path,
    target_str: &str,
    replacement_str: &str,
) -> Result<(), RenameError> {
    let entries = fs::read_dir(directory)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
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

#[command]
pub fn adjust_episode_numbers_in_directory(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    adjustment_value: i32,
    window: Window, // To emit events
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    // Calculate the minimum episode number
    let min_episode_number = find_min_episode_number(&current_path)
        .map_err(|e| format!("Failed to find minimum episode number: {}", e))?;

    // Prevent negative episode numbers
    if adjustment_value < 0 && min_episode_number + adjustment_value < 1 {
        return Err(format!(
            "Adjustment of {} would result in negative episode numbers.",
            adjustment_value
        ));
    }

    adjust_episode_numbers(&current_path, adjustment_value)
        .map_err(|e| format!("Failed to adjust episode numbers: {:?}", e))?;

    // Emit an event when adjustment is successful
    window
        .emit("trigger-reload", "Episode numbers adjusted successfully")
        .unwrap();

    Ok(())
}

fn find_min_episode_number(directory: &Path) -> Result<i32, io::Error> {
    let entries = fs::read_dir(directory)?;
    let pattern = Regex::new(r"(S\d{2,3})E(\d{2,3})").unwrap();
    let mut min_episode_number = i32::MAX;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(caps) = pattern.captures(file_name) {
                    if let Ok(episode_number) = caps[2].parse::<i32>() {
                        if episode_number < min_episode_number {
                            min_episode_number = episode_number;
                        }
                    }
                }
            }
        }
    }

    if min_episode_number == i32::MAX {
        Err(io::Error::new(
            io::ErrorKind::NotFound,
            "No episodes found in the directory",
        ))
    } else {
        Ok(min_episode_number)
    }
}

pub fn adjust_episode_numbers(directory: &Path, adjustment_value: i32) -> Result<(), io::Error> {
    let entries = fs::read_dir(directory)?;
    let pattern = Regex::new(r"(S\d{2,3})E(\d{2,3})").unwrap();

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(new_file_name) =
                    adjust_episode_number_in_filename(file_name, &pattern, adjustment_value)
                {
                    let new_path = path.with_file_name(new_file_name);
                    fs::rename(&path, new_path)?;
                }
            }
        }
    }

    Ok(())
}

fn adjust_episode_number_in_filename(
    file_name: &str,
    pattern: &Regex,
    adjustment_value: i32,
) -> Option<String> {
    if let Some(caps) = pattern.captures(file_name) {
        let season_part = &caps[1]; // e.g., "S01" or "S010"
        let episode_number_str = &caps[2]; // e.g., "01" or "001"

        if let Ok(episode_number) = episode_number_str.parse::<i32>() {
            let new_episode_number = episode_number + adjustment_value;
            if new_episode_number < 1 {
                return None; // Skip renaming if the new episode number would be negative
            }
            let new_episode_str = format!(
                "{:0width$}",
                new_episode_number,
                width = episode_number_str.len()
            );
            let new_file_name = pattern
                .replace(file_name, format!("{}E{}", season_part, new_episode_str))
                .to_string();
            return Some(new_file_name);
        }
    }
    None
}
