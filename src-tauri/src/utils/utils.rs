use tauri::{AppHandle, Manager, Window, WindowBuilder, WindowUrl};

// Public command to emit "trigger-reload" event
#[tauri::command]
pub fn trigger_refresh(window: Window) -> Result<(), String> {
    window
        .emit("trigger-reload", "Reload event triggered")
        .map_err(|e| format!("Failed to emit event: {:?}", e))
}

#[tauri::command]
pub async fn open_episode_title_window(app: AppHandle) {
    // Check if the window already exists
    if let Some(window) = app.get_window("episode_fetcher") {
        // Call focus_fetcher_window if the window exists
        if let Some(fetcher_window) = window.get_window("episode_fetcher") {
            // Check if the window is minimized and maximize it if necessary
            if fetcher_window.is_minimized().unwrap_or(false) {
                fetcher_window
                    .unminimize()
                    .expect("Failed to unminimize window");
            }
            fetcher_window.set_focus().expect("Failed to set focus");
        }
    } else {
        // Create a new window if it does not exist
        let _new_window = WindowBuilder::new(
            &app,
            "episode_fetcher", // Unique label for the new window
            WindowUrl::App("/episode-fetcher".into()), // Load Next.js route
        )
        .title("Episoden Titel laden")
        .inner_size(688.0, 600.0) // Set window size
        .resizable(true) // Make the window non-resizable if you prefer
        .build()
        .unwrap(); // Handle possible errors here
    }
}

#[tauri::command]
pub fn focus_main_window(window: Window) {
    if let Some(main_window) = window.get_window("main") {
        main_window.set_focus().expect("Failed to set focus");
    }
}
