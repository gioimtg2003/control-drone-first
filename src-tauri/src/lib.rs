use std::sync::{Arc, Mutex};

use mavlink::common::MavMessage;
use tauri::State;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
struct DroneConnection(Arc<Mutex<Option<Box<dyn mavlink::MavConnection<MavMessage> + Send>>>>);

#[tauri::command]
async fn connect_to_drone(
    port: String,
    baud: u32,
    state: State<'_, DroneConnection>,
) -> Result<String, String> {
    let mut lock = state.0.lock().unwrap();
    if lock.is_some() {
        println!("[DEBUG] State Lock: Has a previous connection");
        *lock = None;
        std::thread::sleep(std::time::Duration::from_millis(100));
        println!("[DEBUG] State Lock: Cleared previous connection");
    } else {
        println!("[DEBUG] State Lock: Is empty (None)");
    }
    let connection_string = format!("serial:{}:{}", port, baud);

    match mavlink::connect::<MavMessage>(&connection_string) {
        Ok(mavconn) => {
            *lock = Some(mavconn);
            println!("[RUST] Connected to {}", connection_string);
            Ok(format!("Connected to {}", port))
        }
        Err(e) => Err(format!("Mavlink Connect Error: {:?}", e)),
    }
}

#[tauri::command]
async fn disconnect_drone(state: State<'_, DroneConnection>) -> Result<String, String> {
    let mut lock = state.0.lock().unwrap();

    if lock.is_some() {
        *lock = None;
        println!("[RUST] Disconnected successfully");
        Ok("Disconnected successfully".into())
    } else {
        Err("No connection is active to disconnect.".into())
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_port_available() -> Vec<String> {
    match serialport::available_ports() {
        Ok(ports) => ports.iter().map(|port| port.port_name.clone()).collect(),
        Err(_) => Vec::new(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(DroneConnection(Arc::new(Mutex::new(None))))
        .invoke_handler(tauri::generate_handler![
            greet,
            get_port_available,
            connect_to_drone,
            disconnect_drone
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
