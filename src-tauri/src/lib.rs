use rsmpeg::ffi::avdevice_register_all;
use std::process::{Command, Stdio};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![show_devices])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn show_devices() -> Vec<String> {
    unsafe {
        avdevice_register_all();

        #[cfg(target_os = "macos")]
        let format_name = "avfoundation";
        #[cfg(target_os = "linux")]
        let format_name = "pulse";
        #[cfg(target_os = "windows")]
        let format_name = "dshow";

        // 使用 ffmpeg 命令行工具列出设备
        let output = Command::new("ffmpeg")
            .args(&["-f", format_name, "-list_devices", "true", "-i", ""])
            .stderr(Stdio::piped())
            .output()
            .expect("无法执行 ffmpeg 命令");

        // 解析输出
        let stderr = String::from_utf8_lossy(&output.stderr);
        let devices: Vec<String> = stderr
            .lines()
            .filter(|line| line.contains("] [") || line.contains("AVFoundation"))
            .map(|line| line.trim().to_string())
            .collect();

        devices
    }
}