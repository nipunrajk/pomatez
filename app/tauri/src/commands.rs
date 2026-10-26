// Originally was only meant to have the commands, though due to the global mutex values adding a few extra for convenience for now
// Will tidy up in the future

use std::sync::Mutex;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Builder, LogicalSize, Runtime, Wry};

#[non_exhaustive]
struct WindowSize;

use crate::system_tray;
#[cfg(desktop)]
use crate::updater;

impl WindowSize {
    // Not sure why, if its due to UI scaling or what though these values seem to size smaller than the same values on electron
    // The classic window is a fixed-size single-purpose timer popup.
    pub const MIN: LogicalSize<u32> = LogicalSize {
        width: 340,
        height: 690,
    };
    pub const DASHBOARD: LogicalSize<u32> = LogicalSize {
        width: 1200,
        height: 760,
    };
    // layout.dashboard.minWidth in modula-theme.json.
    pub const DASHBOARD_MIN: LogicalSize<u32> = LogicalSize {
        width: 1100,
        height: 620,
    };
}

// The window always starts at the classic size from tauri.conf.json.
static IS_DASHBOARD: Mutex<bool> = Mutex::new(false);

#[tauri::command]
fn set_layout<R: Runtime>(layout: String, window: tauri::WebviewWindow<R>) {
    let dashboard = layout == "dashboard";
    {
        let mut current = IS_DASHBOARD.lock().unwrap();
        // Also sent on every launch; only resize on an actual change.
        if *current == dashboard {
            return;
        }
        *current = dashboard;
    }

    try_set_resizeable(true, &window);
    if dashboard {
        let _ = window.set_maximizable(true);
        try_set_min_size(Some(WindowSize::DASHBOARD_MIN), &window);
        try_set_size(WindowSize::DASHBOARD, &window);
        let _ = window.center();
    } else {
        if window.is_maximized().unwrap_or(false) {
            let _ = window.unmaximize();
        }
        let _ = window.set_maximizable(false);
        // Lower the minimum first, or the OS clamps the shrink to it.
        try_set_min_size(Some(WindowSize::MIN), &window);
        try_set_size(WindowSize::MIN, &window);
    }
}

static HAS_DECORATIONS: Mutex<bool> = Mutex::new(true);

// Mirrors the renderer's `closeToTray` setting (default matches
// `defaultSettings.ts`). Kept in sync via `set_close_to_tray` so the
// native window-close button, which never goes through the `close_window`
// command, can still decide whether to hide to tray instead of closing.
pub static CLOSE_TO_TRAY: Mutex<bool> = Mutex::new(true);

#[tauri::command]
fn set_close_to_tray(close_to_tray: bool) {
    *CLOSE_TO_TRAY.lock().unwrap() = close_to_tray;
}

#[tauri::command]
fn minimize_window<R: Runtime>(minimize_to_tray: bool, window: tauri::Window<R>) {
    println!("Minimize! {}", minimize_to_tray.to_string().as_str());
    if minimize_to_tray {
        window.hide().unwrap();
    } else {
        window.minimize().unwrap();
    }
}

#[tauri::command]
fn close_window<R: Runtime>(close_to_tray: bool, window: tauri::Window<R>) {
    println!("set_close! {}", close_to_tray);
    if close_to_tray {
        window.hide().unwrap();
    } else {
        window.close().unwrap();
    }
}

#[tauri::command]
fn show_window<R: Runtime>(window: tauri::WebviewWindow<R>) {
    system_tray::show_on_current_workspace(&window);
}

#[tauri::command]
fn set_always_on_top<R: Runtime>(always_on_top: bool, window: tauri::WebviewWindow<R>) {
    println!("set_always_on_top! {}", always_on_top);
    try_set_always_on_top(always_on_top, &window);
}

#[tauri::command]
fn set_fullscreen_break<R: Runtime>(
    should_fullscreen: bool,
    always_on_top: bool,
    window: tauri::WebviewWindow<R>,
) {
    println!(
        "set_fullscreen_break! {} {}",
        should_fullscreen, always_on_top
    );

    try_set_always_on_top(always_on_top, &window);
    if should_fullscreen {
        try_set_native_titlebar(true, &window);
    } else {
        let decorations_mutex = HAS_DECORATIONS.lock().unwrap();
        let decorations = *decorations_mutex;
        drop(decorations_mutex);
        try_set_native_titlebar(decorations, &window);
    }

    try_set_fullscreen(should_fullscreen, &window);
}

fn try_set_fullscreen<R: Runtime>(fullscreen: bool, window: &tauri::WebviewWindow<R>) {
    match window.set_fullscreen(fullscreen) {
        Ok(_) => (),
        Err(e) => println!("There was a problem setting fullscreen: {}", e),
    }
}

fn try_set_always_on_top<R: Runtime>(always_on_top: bool, window: &tauri::WebviewWindow<R>) {
    match window.set_always_on_top(always_on_top) {
        Ok(_) => (),
        Err(e) => println!("There was a problem altering always on top: {}", e),
    }
}

fn try_set_min_size<R: Runtime>(size: Option<LogicalSize<u32>>, window: &tauri::WebviewWindow<R>) {
    match window.set_min_size(size) {
        //Some(size)) {
        Ok(_) => (),
        Err(e) => println!("There was a problem setting min size! {:?}", e),
    }
}

fn try_set_size<R: Runtime>(size: LogicalSize<u32>, window: &tauri::WebviewWindow<R>) {
    match window.set_size(size) {
        Ok(_) => (),
        Err(e) => println!("There was a problem setting the window size! {:?}", e),
    }
    println!("Set size to {:?}", size);
}

fn try_set_resizeable<R: Runtime>(resizeable: bool, window: &tauri::WebviewWindow<R>) {
    println!("Window resizeable {:?}", resizeable);
    match window.set_resizable(resizeable) {
        Ok(_) => (),
        Err(e) => println!("There was a problem making the window resizeable {:?}", e),
    }
}

#[tauri::command]
fn set_ui_theme<R: Runtime>(is_dark_mode: bool, window: tauri::WebviewWindow<R>) -> Result<(), String> {
    let theme = if is_dark_mode {
        tauri::Theme::Dark
    } else {
        tauri::Theme::Light
    };
    window
        .set_theme(Some(theme))
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn set_native_titlebar<R: Runtime>(use_native_titlebar: bool, window: tauri::WebviewWindow<R>) {
    {
        let mut decorations = HAS_DECORATIONS.lock().unwrap();
        if *decorations == use_native_titlebar {
            println!("set_native_titlebar! {} already set", use_native_titlebar);
            return;
        }
        *decorations = use_native_titlebar;
        drop(decorations);
    }
    try_set_native_titlebar(use_native_titlebar, &window);
}

pub fn try_set_native_titlebar<R: Runtime>(use_native_titlebar: bool, window: &tauri::WebviewWindow<R>) {
    match window.set_decorations(use_native_titlebar) {
        Ok(_) => (),
        Err(e) => println!(
            "There was a problem setting the window decorations! {:?}",
            e
        ),
    }
    println!("set_native_titlebar! {}", use_native_titlebar);
}

/**
* We could do this by passing the object into a custom function that adds the commands but I wanted
* to practice more with rust. Plus it makes the setup cleaner.

* Switch to a function that takes and returns tauri::Builder<Wry> or uses a reference if we need to
* switch it.
*/
pub trait PomatezCommands {
    fn register_pomatez_commands(self) -> tauri::Builder<Wry>;
}

impl PomatezCommands for Builder<Wry> {
    #[cfg(desktop)]
    fn register_pomatez_commands(self) -> tauri::Builder<Wry> {
        self.invoke_handler(tauri::generate_handler![
            show_window,
            set_always_on_top,
            set_fullscreen_break,
            set_ui_theme,
            set_native_titlebar,
            system_tray::tray_icon_update,
            system_tray::tray_title_update,
            close_window,
            set_close_to_tray,
            set_layout,
            minimize_window,
            updater::check_for_updates,
            updater::install_update
        ])
    }

    #[cfg(not(desktop))]
    fn register_pomatez_commands(self) -> tauri::Builder<Wry> {
        self.invoke_handler(tauri::generate_handler![
            show_window,
            set_always_on_top,
            set_fullscreen_break,
            set_ui_theme,
            set_native_titlebar,
            system_tray::tray_icon_update,
            system_tray::tray_title_update,
            close_window,
            set_close_to_tray,
            set_layout,
            minimize_window
        ])
    }
}
