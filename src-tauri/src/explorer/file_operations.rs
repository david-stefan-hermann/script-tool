use crate::explorer::file_explorer::{is_video_file, FileExplorer}; // Import necessary items
use regex::Regex;
use sanitize_filename::sanitize;
use serde::Serialize;
use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{command, State, Window};

// STRUCTS
#[derive(Serialize, Clone)]
struct PreviewPayload {
    new_file_names: Vec<String>,
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
pub async fn add_titles_to_episodes(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    episode_titles: Vec<String>, // List of episode titles from the frontend
    window: Window,              // To emit events
) -> Result<(), String> {
    // Generate new file names
    let new_file_names =
        add_titles_to_episodes_generate_file_titles(state.clone(), episode_titles.clone())
            .await
            .map_err(|e| format!("Failed to generate new file names: {:?}", e))?;

    // Get the current path from FileExplorer
    let current_path = {
        let explorer = state.lock().unwrap();
        PathBuf::from(explorer.get_current_path())
    };

    // Rename media files
    add_titles_to_episodes_rename_media_files(&current_path, &new_file_names)
        .await
        .map_err(|e| format!("Failed to rename files: {:?}", e))?;

    // Emit an event when renaming is successful
    window
        .emit(
            "trigger-reload",
            "Files renamed with episode titles successfully",
        )
        .unwrap();

    Ok(())
}

#[command]
pub async fn add_titles_to_episodes_generate_file_titles(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    episode_titles: Vec<String>, // Use Vec<String> to pass the episode titles from the frontend
) -> Result<Vec<String>, String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    let entries =
        fs::read_dir(&current_path).map_err(|e| format!("Failed to read directory: {:?}", e))?;
    let pattern = Regex::new(r"(S\d{2,3}E\d{2,3})").unwrap(); // Pattern to match SXXEXX or SXXEXXX
    let mut episode_idx = 0; // Track episode title index
    let mut new_file_names = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {:?}", e))?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(new_file_name) =
                    create_new_file_name(file_name, &pattern, &episode_titles, &mut episode_idx)
                {
                    new_file_names.push(new_file_name);
                }
            }
        }
    }

    Ok(new_file_names)
}

#[command]
pub async fn add_titles_to_episodes_preview(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    episode_titles: Vec<String>, // List of episode titles from the frontend
    window: Window,              // To emit events
) -> Result<(), String> {
    // Generate new file names
    let new_file_names =
        add_titles_to_episodes_generate_file_titles(state.clone(), episode_titles.clone())
            .await
            .map_err(|e| format!("Failed to generate new file names: {:?}", e))?;

    // Get the current path from FileExplorer
    let current_path = {
        let explorer = state.lock().unwrap();
        PathBuf::from(explorer.get_current_path())
    };

    // Get the file extensions from the current directory
    let entries =
        fs::read_dir(&current_path).map_err(|e| format!("Failed to read directory: {:?}", e))?;
    let mut file_extensions = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {:?}", e))?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(extension) = path.extension().and_then(OsStr::to_str) {
                file_extensions.push(extension.to_string());
            }
        }
    }

    // Append the extensions to the new file names
    let mut final_file_names = Vec::new();
    for (new_file_name, extension) in new_file_names.iter().zip(file_extensions.iter()) {
        let final_file_name = format!("{}.{}", new_file_name, extension);
        final_file_names.push(final_file_name);
    }

    // Emit an event with the preview file names
    window
        .emit(
            "trigger-preview",
            PreviewPayload {
                new_file_names: final_file_names.clone(),
            },
        )
        .unwrap();

    Ok(())
}

pub async fn add_titles_to_episodes_rename_media_files(
    directory: &Path,
    new_file_names: &[String], // Slice of new file names
) -> Result<(), io::Error> {
    let entries = fs::read_dir(directory)?;
    let mut file_idx = 0; // Track file index

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(_file_name) = path.file_name().and_then(OsStr::to_str) {
                if file_idx < new_file_names.len() {
                    let new_file_name = &new_file_names[file_idx];
                    file_idx += 1;

                    // Split the filename and extension
                    let extension = path.extension().and_then(OsStr::to_str).unwrap_or("");
                    let sanitized_base_name = sanitize(new_file_name); // Sanitize the base file name

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

fn create_new_file_name(
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

// START SEARCH AND REPLACE FILE TITLES

#[command]
pub fn search_and_replace(
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

    search_and_replace_rename_media_files_in_directory(
        &current_path,
        &target_str,
        &replacement_str,
    )
    .map_err(|e| format!("Failed to rename files: {:?}", e))?;

    // Emit an event when renaming is successful
    window
        .emit("trigger-reload", "Files renamed successfully")
        .unwrap();

    Ok(())
}

pub fn search_and_replace_rename_media_files_in_directory(
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
pub fn search_and_replace_preview(
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

    let entries =
        fs::read_dir(&current_path).map_err(|e| format!("Failed to read directory: {:?}", e))?;
    let mut new_file_names = Vec::new();
    let mut file_extensions = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {:?}", e))?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                let new_file_name = file_name.replace(&target_str, &replacement_str);
                new_file_names.push(new_file_name);
                if let Some(extension) = path.extension().and_then(OsStr::to_str) {
                    file_extensions.push(extension.to_string());
                }
            } else {
                return Err("Invalid filename.".to_string());
            }
        }
    }

    // Emit an event with the preview file names
    window
        .emit(
            "trigger-preview",
            PreviewPayload {
                new_file_names: new_file_names.clone(),
            },
        )
        .map_err(|e| format!("Failed to emit event: {:?}", e))?;

    Ok(())
}

// END SEARCH AND REPLACE FILE TITLES

// START ADJUST EPISODE NUMBERS

#[command]
pub fn adjust_episode_numbers(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    adjustment_value: i32,
    window: Window, // To emit events
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    // Check if the adjustment would result in negative episode numbers
    let min_episode_number = find_min_episode_number(&current_path)
        .map_err(|e| format!("Failed to find minimum episode number: {:?}", e))?;

    if adjustment_value < 0 && min_episode_number + adjustment_value < 0 {
        return Err(format!(
            "Cannot adjust episode numbers by {}. Minimum episode number is E{:02}, which would result in negative episode numbers.",
            adjustment_value, min_episode_number
        ));
    }

    adjust_episode_numbers_renaming(&current_path, adjustment_value)
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
        return Err(io::Error::new(io::ErrorKind::NotFound, "No episodes found"));
    }

    Ok(min_episode_number)
}

fn adjust_episode_numbers_renaming(
    directory: &Path,
    adjustment_value: i32,
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
            if let Some(new_file_name) = adjust_episode_counter_in_filename(
                file_name,
                &pattern,
                adjustment_value,
            ) {
                let new_path = path.with_file_name(new_file_name);

                // Rename the file
                fs::rename(&path, new_path)?;
            }
        }
    }

    Ok(())
}

fn adjust_episode_counter_in_filename(
    file_name: &str,
    pattern: &Regex,
    adjustment_value: i32,
) -> Option<String> {
    if let Some(caps) = pattern.captures(file_name) {
        let season_part = &caps[1]; // e.g., "S01" or "S010"
        let episode_number_str = &caps[2]; // e.g., "01" or "001"

        if let Ok(episode_number) = episode_number_str.parse::<i32>() {
            let new_episode_number = episode_number + adjustment_value;

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

#[command]
pub fn adjust_episode_numbers_preview(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    adjustment_value: i32,
    window: Window, // To emit events
) -> Result<(), String> {
    let explorer = state.lock().unwrap();
    let current_path = PathBuf::from(explorer.get_current_path());

    // Check if the adjustment would result in negative episode numbers
    let min_episode_number = find_min_episode_number(&current_path)
        .map_err(|e| format!("Failed to find minimum episode number: {:?}", e))?;

    if adjustment_value < 0 && min_episode_number + adjustment_value < 0 {
        return Err(format!(
            "Cannot adjust episode numbers by {}. Minimum episode number is E{:02}, which would result in negative episode numbers.",
            adjustment_value, min_episode_number
        ));
    }

    let entries =
        fs::read_dir(&current_path).map_err(|e| format!("Failed to read directory: {:?}", e))?;
    let mut new_file_names = Vec::new();
    let mut file_extensions = Vec::new();

    let pattern = Regex::new(r"(S\d{2,3})E(\d{2,3})").unwrap();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {:?}", e))?;
        let path = entry.path();

        if path.is_file() && is_video_file(&path) {
            if let Some(file_name) = path.file_name().and_then(OsStr::to_str) {
                if let Some(new_file_name) = adjust_episode_counter_in_filename(
                    file_name,
                    &pattern,
                    adjustment_value,
                ) {
                    new_file_names.push(new_file_name);
                    if let Some(extension) = path.extension().and_then(OsStr::to_str) {
                        file_extensions.push(extension.to_string());
                    }
                } else {
                    // If no adjustment, keep the original file name
                    new_file_names.push(file_name.to_string());
                    if let Some(extension) = path.extension().and_then(OsStr::to_str) {
                        file_extensions.push(extension.to_string());
                    }
                }
            } else {
                return Err("Invalid filename.".to_string());
            }
        }
    }

    // Emit an event with the preview file names
    window
        .emit(
            "trigger-preview",
            PreviewPayload {
                new_file_names: new_file_names.clone(),
            },
        )
        .map_err(|e| format!("Failed to emit event: {:?}", e))?;

    Ok(())
}

// END ADJUST EPISODE NUMBERS
