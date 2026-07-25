use tauri::{Manager, Emitter};

#[derive(Clone, serde::Serialize)]
struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // Ahora que Emitter está en el scope, puedes usar .emit() de manera estricta
            let _ = app.emit("single-instance", SingleInstancePayload { args: argv, cwd });
        }))
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux", target_os = "macos"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register("vetlink-app")?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
