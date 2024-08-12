use dirs;
use serde::Serialize;
use std::ffi::OsString;
use std::fs;
use std::os::windows::ffi::OsStrExt;
use std::os::windows::ffi::OsStringExt;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::command;
use winapi::um::fileapi::GetDriveTypeW;
use winapi::um::fileapi::{GetLogicalDrives, GetVolumeInformationW};
use winapi::um::winbase::{DRIVE_FIXED, DRIVE_REMOTE};

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
}

impl FileExplorer {
    pub fn new() -> Self {
        Self {
            current_path: dirs::home_dir().unwrap_or_else(|| PathBuf::from("/")),
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
            Ok(())
        } else {
            Err("Path is not a directory".to_string())
        }
    }

    pub fn go_to_parent_directory(&mut self) -> Result<(), String> {
        if let Some(parent) = self.current_path.parent() {
            self.current_path = parent.to_path_buf();
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
        self.current_path = home_dir.clone();  // Update the current path to home directory
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

#[derive(Serialize)]
pub struct DirectoryHierarchy {
    full_path: String,
    dir_name: String,
}

#[derive(Serialize)]
pub struct DriveInfo {
    letter: String,
    name: String,
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
pub fn list_drives() -> Result<Vec<DriveInfo>, String> {
    let drives_bitmask = unsafe { GetLogicalDrives() };
    if drives_bitmask == 0 {
        return Err("Failed to get logical drives".to_string());
    }

    let mut drives = Vec::new();
    for i in 0..26 {
        if drives_bitmask & (1 << i) != 0 {
            let drive_letter = (b'A' + i) as u16;
            let drive = OsString::from_wide(&[drive_letter, b':' as u16, b'\\' as u16, 0]);
            let drive_wide: Vec<u16> = drive.encode_wide().collect();
            let drive_type = unsafe { GetDriveTypeW(drive_wide.as_ptr()) };
            if drive_type == DRIVE_FIXED || drive_type == DRIVE_REMOTE {
                let mut volume_name = [0u16; 256];
                let success = unsafe {
                    GetVolumeInformationW(
                        drive_wide.as_ptr(),
                        volume_name.as_mut_ptr(),
                        volume_name.len() as u32,
                        std::ptr::null_mut(),
                        std::ptr::null_mut(),
                        std::ptr::null_mut(),
                        std::ptr::null_mut(),
                        0,
                    )
                };
                let volume_name = if success != 0 {
                    let volume_name_str = OsString::from_wide(&volume_name)
                        .to_string_lossy()
                        .trim_end_matches('\u{0}')
                        .to_string();
                    volume_name_str
                } else {
                    "Unknown".to_string()
                };
                drives.push(DriveInfo {
                    letter: drive
                        .to_string_lossy()
                        .trim_end_matches('\u{0}')
                        .to_string(),
                    name: volume_name,
                });
            }
        }
    }

    if drives.is_empty() {
        Err("No drives found".to_string())
    } else {
        Ok(drives)
    }
}

#[command]
pub fn list_files_in_home_directory(
    state: tauri::State<'_, Arc<Mutex<FileExplorer>>>,
) -> Result<Vec<FileInfo>, String> {
    let mut explorer = state.lock().unwrap();
    explorer.list_files_in_home_directory()
}
