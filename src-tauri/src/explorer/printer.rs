use crate::explorer::file_explorer::{is_video_file, FileExplorer, FileInfo};
use crate::{AppState, WindowState};
use sanitize_filename::sanitize;
use std::fs;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use tauri::{command, AppHandle, Manager, State, WindowBuilder, WindowUrl};
use tokio::sync::Mutex as AsyncMutex;
use tokio_util::sync::CancellationToken;

#[command]
pub async fn print_media_files_in_directories(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    app_state: State<'_, Arc<AsyncMutex<AppState>>>,
    app: AppHandle, // To open a new window
    window_state: State<'_, Arc<Mutex<WindowState>>>,
) -> Result<Vec<FileInfo>, String> {
    // Cancel the previous task if it exists
    {
        let mut app_state = app_state.lock().await;
        if let Some(token) = &app_state.cancellation_token {
            token.cancel();
        }
        app_state.cancellation_token = Some(CancellationToken::new());
    }

    let current_dir;
    {
        let explorer = state.lock().map_err(|e| e.to_string())?;
        current_dir = PathBuf::from(explorer.get_current_path());
    } // MutexGuard is dropped here

    let mut media_files = vec![];
    let token = {
        let app_state = app_state.lock().await;
        app_state.cancellation_token.clone().unwrap()
    };

    get_media_files_recursive(&current_dir, &mut media_files, token.clone()).await?;

    // Open a new window and send the media files data
    open_media_files_window(app, media_files.clone(), window_state).await?;

    Ok(media_files)
}

fn get_media_files_recursive<'a>(
    dir: &'a Path,
    media_files: &'a mut Vec<FileInfo>,
    token: CancellationToken,
) -> Pin<Box<dyn Future<Output = Result<(), String>> + Send + 'a>> {
    Box::pin(async move {
        if token.is_cancelled() {
            return Err("Operation cancelled".into());
        }

        match fs::read_dir(dir) {
            Ok(entries) => {
                for entry in entries {
                    if token.is_cancelled() {
                        return Err("Operation cancelled".into());
                    }

                    match entry {
                        Ok(entry) => {
                            let path = entry.path();
                            if path.is_dir() {
                                if let Err(e) =
                                    get_media_files_recursive(&path, media_files, token.clone())
                                        .await
                                {
                                    eprintln!("Failed to read directory {}: {}", path.display(), e);
                                }
                            } else if path.is_file() {
                                let is_video = is_video_file(&path);
                                if is_video {
                                    let file_name =
                                        path.file_name().unwrap().to_string_lossy().to_string();
                                    let sanitized_name = sanitize(&file_name);

                                    media_files.push(FileInfo {
                                        path: path.to_string_lossy().to_string(),
                                        is_dir: false,
                                        is_video,
                                        name: sanitized_name,
                                    });
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to read entry in directory {}: {}", dir.display(), e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to read directory {}: {}", dir.display(), e);
            }
        }
        Ok(())
    })
}

#[tauri::command]
pub async fn open_media_files_window(
    app: AppHandle,
    media_files: Vec<FileInfo>,
    window_state: State<'_, Arc<Mutex<WindowState>>>,
) -> Result<(), String> {
    // Create a unique label for the new window
    let window_label = format!("media_files_window_{}", uuid::Uuid::new_v4());

    // Serialize the media files data to JSON
    let media_files_json = serde_json::to_string(&media_files).map_err(|e| e.to_string())?;

    // Create a new window
    let _new_window = WindowBuilder::new(
        &app,
        &window_label,                          // Unique label for the new window
        WindowUrl::App("/file-printer".into()), // Load the route
    )
    .title("Media Files")
    .inner_size(688.0, 600.0) // Set window size
    .resizable(true) // Make the window resizable
    .initialization_script(&format!("window.initialData = {};", media_files_json))
    .build()
    .map_err(|e| e.to_string())?;

    // Store the window label to prevent sending data multiple times
    {
        let mut state = window_state.lock().unwrap();
        state.sent_windows.insert(window_label);
    }

    Ok(())
}

#[command]
pub async fn print_file_sizes(
    state: State<'_, Arc<Mutex<FileExplorer>>>,
    app_state: State<'_, Arc<AsyncMutex<AppState>>>,
    app: AppHandle, // To open a new window
    window_state: State<'_, Arc<Mutex<WindowState>>>,
) -> Result<Vec<FileInfo>, String> {
    // Cancel the previous task if it exists
    {
        let mut app_state = app_state.lock().await;
        if let Some(token) = &app_state.cancellation_token {
            token.cancel();
        }
        app_state.cancellation_token = Some(CancellationToken::new());
    }

    let current_dir;
    {
        let explorer = state.lock().map_err(|e| e.to_string())?;
        current_dir = PathBuf::from(explorer.get_current_path());
    } // MutexGuard is dropped here

    let token = {
        let app_state = app_state.lock().await;
        app_state.cancellation_token.clone().unwrap()
    };

    let mut file_info_list = vec![];
    let entries = fs::read_dir(&current_dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        let size = if metadata.is_dir() {
            get_directory_size(&path, token.clone())?
        } else {
            metadata.len()
        };
        let size_str = if size >= 1_073_741_824 {
            format!("{:.2} GB", size as f64 / 1_073_741_824.0)
        } else if size >= 1_048_576 {
            format!("{:.2} MB", size as f64 / 1_048_576.0)
        } else {
            format!("{:.2} KB", size as f64 / 1_024.0)
        };
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        file_info_list.push(FileInfo {
            path: path.to_string_lossy().to_string(),
            is_dir: path.is_dir(),
            is_video: is_video_file(&path),
            name: format!("{} - {}", name, size_str),
        });
    }

    // Sort the file_info_list by size
    file_info_list.sort_by(|a, b| {
        let a_size = extract_size(&a.name);
        let b_size = extract_size(&b.name);
        b_size.cmp(&a_size)
    });

    // Open a new window and send the file sizes data
    open_media_files_window(app, file_info_list.clone(), window_state).await?;

    Ok(file_info_list)
}

fn get_directory_size(path: &PathBuf, token: CancellationToken) -> Result<u64, String> {
    if token.is_cancelled() {
        return Err("Operation cancelled".into());
    }

    let mut total_size = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let metadata = fs::metadata(entry.path()).unwrap();
                if metadata.is_dir() {
                    total_size += get_directory_size(&entry.path(), token.clone())?;
                } else {
                    total_size += metadata.len();
                }
            }
        }
    }
    Ok(total_size)
}

fn extract_size(size_str: &str) -> u64 {
    let parts: Vec<&str> = size_str.split_whitespace().collect();
    if parts.len() < 3 {
        return 0;
    }
    let size: f64 = parts[2].parse().unwrap_or(0.0);
    match parts[3] {
        "GB" => (size * 1_073_741_824.0) as u64,
        "MB" => (size * 1_048_576.0) as u64,
        "KB" => (size * 1_024.0) as u64,
        _ => 0,
    }
}

#[command]
pub async fn cancel_file_printer(
    app_state: State<'_, Arc<AsyncMutex<AppState>>>,
    app: AppHandle, // Add AppHandle to emit events
) -> Result<(), String> {
    let mut app_state = app_state.lock().await;
    if let Some(token) = &app_state.cancellation_token {
        token.cancel();
        app_state.cancellation_token = None;

        // Emit an event to notify the frontend about the cancellation
        app.emit_all("cancel_file_printer", {})
            .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No ongoing task to cancel".into())
    }
}
