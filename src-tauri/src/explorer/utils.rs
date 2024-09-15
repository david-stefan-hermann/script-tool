use serde::Serialize;
use std::ffi::OsString;
use std::os::windows::ffi::OsStrExt;
use std::os::windows::ffi::OsStringExt;
use std::sync::{Arc, Mutex};
use tauri::command;
use winapi::um::fileapi::GetDriveTypeW;
use winapi::um::fileapi::{GetLogicalDrives, GetVolumeInformationW};
use winapi::um::winbase::{DRIVE_FIXED, DRIVE_REMOTE};

use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use super::file_explorer::FileExplorer;
use super::file_explorer::FileInfo;

#[derive(Debug, Serialize)]
pub struct DriveInfo {
    pub letter: String,
    pub name: String,
    pub is_offline: bool,
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
                let (tx, rx) = mpsc::channel();
                let drive_wide_clone = drive_wide.clone();

                thread::spawn(move || {
                    let mut volume_name = [0u16; 256];
                    let success = unsafe {
                        GetVolumeInformationW(
                            drive_wide_clone.as_ptr(),
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
                    tx.send((volume_name, success != 0)).unwrap();
                });

                let (volume_name, is_online) = match rx.recv_timeout(Duration::from_secs(2)) {
                    Ok((name, online)) => (name, online),
                    Err(_) => ("Unknown".to_string(), false),
                };

                drives.push(DriveInfo {
                    letter: drive
                        .to_string_lossy()
                        .trim_end_matches('\u{0}')
                        .to_string(),
                    name: volume_name,
                    is_offline: !is_online,
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
