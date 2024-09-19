use crate::explorer::file_explorer::{is_video_file, FileExplorer, FileInfo};
use crate::{AppState, WindowState};
use sanitize_filename::sanitize;
use std::fs::{self, File};
use std::future::Future;
use std::io::Write; // Bring the Write trait into scope
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use tauri::{command, AppHandle, Manager, State, WindowBuilder, WindowUrl};
use tokio::sync::Mutex as AsyncMutex;
use tokio_util::sync::CancellationToken;

// Open a new window with the media files data

#[tauri::command]
pub async fn open_media_files_window(
    app: AppHandle,
    media_files: Vec<FileInfo>,
    file_name: String,
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
    .initialization_script(&format!(
        "window.initialData = {{ filesData: {}, fileName: '{}' }};",
        media_files_json, file_name
    ))
    .build()
    .map_err(|e| e.to_string())?;

    // Store the window label to prevent sending data multiple times
    {
        let mut state = window_state.lock().unwrap();
        state.sent_windows.insert(window_label);
    }

    Ok(())
}

// Cancel operations

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

// download media files

#[command]
pub fn save_file_to_folder(
    folder_path: String,
    file_info_list: Vec<FileInfo>,
) -> Result<(), String> {
    let file_path = PathBuf::from(folder_path);
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;

    for file_info in file_info_list {
        writeln!(file, "{}", file_info.name).map_err(|e| e.to_string())?;
    }

    Ok(())
}

// Print Media Files in Directories

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

    // Get the current directory name with a fallback and add the prefix "media_files_"
    let current_dir_name = current_dir
        .file_name()
        .map(|name| format!("media_files_{}", name.to_string_lossy()))
        .or_else(|| {
            current_dir
                .parent()
                .and_then(|p| p.file_name())
                .map(|name| format!("media_files_{}", name.to_string_lossy()))
        })
        .unwrap_or_else(|| "media_files".to_string());

    // Open a new window and send the media files data
    open_media_files_window(app, media_files.clone(), current_dir_name, window_state).await?;

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

// Print file sizes

fn format_size(size: u64) -> String {
    if size >= 1_073_741_824 {
        format!("{:.2} GB", size as f64 / 1_073_741_824.0)
    } else if size >= 1_048_576 {
        format!("{:.2} MB", size as f64 / 1_048_576.0)
    } else {
        format!("{:.2} KB", size as f64 / 1_024.0)
    }
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
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        let file_info = FileInfo {
            path: path.to_string_lossy().to_string(),
            is_dir: path.is_dir(),
            is_video: is_video_file(&path),
            name,
        };
        file_info_list.push((file_info, size));
    }

    // Sort the file_info_list by size
    file_info_list.sort_by(|a, b| b.1.cmp(&a.1));

    // Create a new list of FileInfo with size appended to the name
    let sorted_file_info_list: Vec<FileInfo> = file_info_list
        .into_iter()
        .map(|(mut file_info, size)| {
            file_info.name = format!("{} - {}", file_info.name, format_size(size));
            file_info
        })
        .collect();

    // Get the current directory name with a fallback and add the prefix "media_files_"
    let current_dir_name = current_dir
        .file_name()
        .map(|name| format!("file_sizes_{}", name.to_string_lossy()))
        .or_else(|| {
            current_dir
                .parent()
                .and_then(|p| p.file_name())
                .map(|name| format!("file_sizes_{}", name.to_string_lossy()))
        })
        .unwrap_or_else(|| "file_sizes".to_string());

    // Open a new window and send the file sizes data
    open_media_files_window(
        app,
        sorted_file_info_list.clone(),
        current_dir_name,
        window_state,
    )
    .await?;

    Ok(sorted_file_info_list)
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
