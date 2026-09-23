use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager, Runtime,
};

use base64::engine::general_purpose;
use base64::Engine;

const TRAY_ID: &str = "main";

#[tauri::command]
pub fn tray_icon_update<R: Runtime>(
    data_url: Option<String>,
    is_template: bool,
    window: tauri::Window<R>,
) {
    let icon = match data_url {
        // Text-only style: no icon graphic at all.
        None => None,
        Some(data_url) => {
            let base64_str = data_url.trim_start_matches("data:image/png;base64,");

            let decoded_vec = match general_purpose::STANDARD.decode(base64_str) {
                Ok(vec) => vec,
                Err(e) => {
                    eprintln!("Error decoding Base64 string: {}", e);
                    return;
                }
            };

            match Image::from_bytes(&decoded_vec) {
                Ok(img) => Some(img),
                Err(e) => {
                    eprintln!("Error parsing tray icon image: {}", e);
                    return;
                }
            }
        }
    };

    if let Some(tray) = window.app_handle().tray_by_id(TRAY_ID) {
        if let Err(e) = tray.set_icon_with_as_template(icon, is_template) {
            eprintln!("Error setting tray icon: {}", e);
        }
    }
}

#[tauri::command]
pub fn tray_title_update<R: Runtime>(title: String, window: tauri::Window<R>) {
    if let Some(tray) = window.app_handle().tray_by_id(TRAY_ID) {
        let title_opt = if title.is_empty() { None } else { Some(title.as_str()) };
        if let Err(e) = tray.set_title(title_opt) {
            eprintln!("Error setting tray title: {}", e);
        }
    }
}

/// On macOS, relies on `move_to_active_space_when_shown` having been
/// applied at startup: showing then moves the window to the current Space,
/// so the activation in `set_focus` has no reason to switch Spaces.
pub fn show_on_current_workspace<R: Runtime>(window: &tauri::WebviewWindow<R>) {
    let _ = window.show();
    let _ = window.set_focus();
}

/// Sets AppKit's `MoveToActiveSpace` so showing or activating the window
/// brings it to the user's current Space instead of switching Spaces to
/// wherever it was last shown.
#[cfg(target_os = "macos")]
pub fn move_to_active_space_when_shown<R: Runtime>(window: &tauri::WebviewWindow<R>) {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

    let Ok(ptr) = window.ns_window() else { return };
    // SAFETY: Tauri hands back a live NSWindow, and this is called from app
    // setup, which runs on the main thread as AppKit requires.
    let ns_window = unsafe { &*(ptr as *const NSWindow) };
    // CanJoinAllSpaces and MoveToActiveSpace are mutually exclusive.
    let behavior = (ns_window.collectionBehavior()
        - NSWindowCollectionBehavior::CanJoinAllSpaces)
        | NSWindowCollectionBehavior::MoveToActiveSpace;
    ns_window.setCollectionBehavior(behavior);
}

pub trait PomatezTray {
    fn set_pomatez_system_tray(&self);
}

impl PomatezTray for App {
    /*
     * The icon is updated after rendering on the frontend so that is handled in the commands file.
     * However the initial setup and behavior is handled here.
     */
    fn set_pomatez_system_tray(&self) {
        println!("Setting system tray");

        let show = MenuItemBuilder::with_id("show", "Show")
            .build(self)
            .expect("failed to build show menu item");
        let quit = MenuItemBuilder::with_id("quit", "Quit")
            .build(self)
            .expect("failed to build quit menu item");
        let menu = MenuBuilder::new(self)
            .items(&[&show, &quit])
            .build()
            .expect("failed to build menu");

        let icon_path: PathBuf = self
            .path()
            .resolve("icons/icon.png", BaseDirectory::Resource)
            .expect("failed to resolve icon path; this should not happen as it is an internal file");

        let icon = Image::from_path(&icon_path).expect("failed to load tray icon image");

        let _ = TrayIconBuilder::with_id(TRAY_ID)
            .menu(&menu)
            .tooltip("Pomatez")
            .icon(icon)
            .on_menu_event(|app, event| match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        show_on_current_workspace(&window);
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            })
            .on_tray_icon_event(|tray, event| {
                if let TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        // Visible-but-unfocused usually means it's on another
                        // Space or behind other apps, so bring it here.
                        let visible = window.is_visible().unwrap_or(false);
                        let focused = window.is_focused().unwrap_or(false);
                        let fullscreen = window.is_fullscreen().unwrap_or(false);
                        if visible && focused {
                            if !fullscreen {
                                let _ = window.hide();
                            }
                        } else {
                            show_on_current_workspace(&window);
                        }
                    }
                }
            })
            .build(self)
            .expect("failed to build tray icon");
    }
}
