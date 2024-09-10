use crate::file_explorer::{is_video_file, FileExplorer}; // Import necessary items
use regex::Regex;
use sanitize_filename::sanitize;
use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{command, State, Window};

// START GET EPISODE TITLES

#[command]
pub fn get_current_episode_names(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<Vec<String>, String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    let entries =
        fs::read_dir(&current_path).map_err(|e| format!("Failed to read directory: {}", e))?;
    let pattern = Regex::new(r"(S\d{2,3}E\d{2,3})").unwrap(); // Pattern to match SXXEXX or SXXEXXX
    let mut episode_names = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(caps) = pattern.captures(file_name) {
                    // Extract the title after the episode number if it exists
                    let episode_title_with_ext = file_name
                        .splitn(2, &caps[0]) // Split based on "SXXEXX"
                        .nth(1) // Take the part after "SXXEXX"
                        .unwrap_or("")
                        .trim() // Trim leading/trailing whitespace
                        .trim_start_matches("- "); // Remove leading " - " if present

                    // Remove file extension
                    let episode_title = episode_title_with_ext
                        .split('.')
                        .next() // Get the part before the extension
                        .unwrap_or("");

                    episode_names.push(episode_title.to_string());
                }
            }
        }
    }

    Ok(episode_names)
}

// END GET EPISODE TITLES

// START RENAME EPISODES WITH TITLES

#[command]
pub fn rename_episodes_with_titles(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    episode_titles: Vec<String>, // List of episode titles from the frontend
    window: Window,              // To emit events
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    // Rename media files by appending episode titles
    rename_media_files_with_titles(&current_path, &episode_titles)
        .map_err(|e| format!("Failed to rename files with episode titles: {:?}", e))?;

    // Emit an event when renaming is successful
    window
        .emit(
            "trigger-reload",
            "Files renamed with episode titles successfully",
        )
        .unwrap();

    Ok(())
}

pub fn rename_media_files_with_titles(
    directory: &Path,
    episode_titles: &[String], // Slice of episode titles
) -> Result<(), io::Error> {
    let entries = fs::read_dir(directory)?;
    let pattern = Regex::new(r"(S\d{2,3}E\d{2,3})").unwrap(); // Pattern to match SXXEXX or SXXEXXX
    let mut episode_idx = 0; // Track episode title index

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(new_file_name) =
                    rename_episode_with_title(file_name, &pattern, episode_titles, &mut episode_idx)
                {
                    // Split the filename and extension
                    let extension = path.extension().and_then(OsStr::to_str).unwrap_or("");
                    let sanitized_base_name = sanitize(&new_file_name); // Sanitize the base file name

                    // Construct the new filename by attaching the extension back
                    let final_file_name = format!("{}.{}", sanitized_base_name, extension);

                    let new_path = path.with_file_name(final_file_name);
                    fs::rename(&path, new_path)?;
                }
            }
        }
    }

    Ok(())
}

fn rename_episode_with_title(
    file_name: &str,
    pattern: &Regex,
    episode_titles: &[String],
    episode_idx: &mut usize,
) -> Option<String> {
    // Check if the file name matches the episode pattern
    if let Some(caps) = pattern.captures(file_name) {
        let episode_counter = &caps[1]; // e.g., "S01E02" or "S01E003"

        // Remove everything after the episode counter
        let base_name = file_name.split(episode_counter).next()?.to_string() + episode_counter;

        // If there are more titles, append the corresponding title
        if *episode_idx < episode_titles.len() {
            let title = &episode_titles[*episode_idx];
            *episode_idx += 1;

            // If the title is empty or just spaces, return the base name (i.e., remove the old title)
            if title.trim().is_empty() {
                return Some(base_name);
            }

            let new_file_name = format!("{} - {}", base_name, title);
            return Some(new_file_name);
        } else {
            return Some(base_name); // If no more titles, just return the base name
        }
    }
    None
}

// END RENAME EPISODES WITH TITLES

// START REPLACE FILE TITLES

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

// END REPLACE FILE TITLES

// START ADJUST EPISODE NUMBERS

#[command]
pub fn adjust_episode_numbers_in_directory(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    adjustment_value: i32,
    window: Window, // To emit events
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    // Check if episode E0 already exists
    let episode_zero_exists = check_if_episode_zero_exists(&current_path)
        .map_err(|e| format!("Failed to check for episode E0: {:?}", e))?;

    // Prevent negative adjustments if E0 already exists
    if episode_zero_exists && adjustment_value < 0 {
        return Err("Episode E0 already exists, cannot adjust to negative episode numbers.".into());
    }

    adjust_episode_numbers(&current_path, adjustment_value, episode_zero_exists)
        .map_err(|e| format!("Failed to adjust episode numbers: {:?}", e))?;

    // Emit an event when adjustment is successful
    window
        .emit("trigger-reload", "Episode numbers adjusted successfully")
        .unwrap();

    Ok(())
}

fn check_if_episode_zero_exists(directory: &Path) -> Result<bool, io::Error> {
    let entries = fs::read_dir(directory)?;
    let pattern = Regex::new(r"(S\d{2,3})E00").unwrap(); // Regex to detect E00

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if pattern.is_match(file_name) {
                    return Ok(true); // Found a file with E00, episode zero exists
                }
            }
        }
    }

    Ok(false) // No file with E00 found
}

pub fn adjust_episode_numbers(
    directory: &Path,
    adjustment_value: i32,
    episode_zero_exists: bool,
) -> Result<(), io::Error> {
    let mut entries: Vec<_> = fs::read_dir(directory)?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_file() && is_video_file(&entry.path()))
        .collect();

    let pattern = Regex::new(r"(S\d{2,3})E(\d{2,3})").unwrap();

    // Sort entries based on the episode number
    entries.sort_by_key(|entry| {
        if let Some(file_name) = entry.path().file_name().and_then(OsStr::to_str) {
            if let Some(caps) = pattern.captures(file_name) {
                if let Ok(episode_number) = caps[2].parse::<i32>() {
                    return episode_number;
                }
            }
        }
        0
    });

    // If adjustment is positive, rename from the highest episode number first
    if adjustment_value > 0 {
        entries.reverse();
    }

    // Perform the renaming process
    for entry in entries {
        let path = entry.path();
        if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
            if let Some(new_file_name) = adjust_episode_number_in_filename(
                file_name,
                &pattern,
                adjustment_value,
                episode_zero_exists,
            ) {
                let new_path = path.with_file_name(new_file_name);

                // Rename the file
                fs::rename(&path, new_path)?;
            }
        }
    }

    Ok(())
}

fn adjust_episode_number_in_filename(
    file_name: &str,
    pattern: &Regex,
    adjustment_value: i32,
    episode_zero_exists: bool, // Indicate if episode E0 already exists
) -> Option<String> {
    if let Some(caps) = pattern.captures(file_name) {
        let season_part = &caps[1]; // e.g., "S01" or "S010"
        let episode_number_str = &caps[2]; // e.g., "01" or "001"

        if let Ok(episode_number) = episode_number_str.parse::<i32>() {
            let new_episode_number = episode_number + adjustment_value;

            // Prevent further negative adjustments if E0 already exists
            if episode_zero_exists && new_episode_number < 0 {
                return None;
            }

            // Block renaming to negative episode numbers
            if new_episode_number < 0 {
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

// END ADJUST EPISODE NUMBERS
