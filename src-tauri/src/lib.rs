use std::sync::{Arc, Mutex};

use mavlink::common::{MavMessage, REQUEST_DATA_STREAM_DATA};
use std::time::Duration;
use tauri::{Emitter, State, Window};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
struct DroneConnection(Arc<Mutex<Option<Box<dyn mavlink::MavConnection<MavMessage> + Send>>>>);

#[tauri::command]
async fn start_telemetry_stream(
    window: Window,
    state: State<'_, DroneConnection>,
) -> Result<(), String> {
    println!("Start read metric stream");
    let state_clone = state.0.clone();

    {
        let lock = state_clone.lock().unwrap();
        if let Some(ref conn) = *lock {
            let header = mavlink::MavHeader::default();
            let request = MavMessage::REQUEST_DATA_STREAM(REQUEST_DATA_STREAM_DATA {
                target_system: 1,
                target_component: 1,
                req_stream_id: 0,     // 0 = ALL STREAMS
                req_message_rate: 10, // 10Hz
                start_stop: 1,
            });
            let _ = conn.send(&header, &request);
            println!("[SYSTEM] Sent REQUEST_DATA_STREAM");
        }
    }

    std::thread::spawn(move || {
        println!("[THREAD] Reading thread running...");
        loop {
            let msg_result = {
                let mut lock = state_clone.lock().unwrap();
                lock.as_mut().map(|conn| conn.recv())
            };

            if let Some(Ok((_header, msg))) = msg_result {
                match msg {
                    MavMessage::ATTITUDE(data) => {
                        let to_deg = 180.0 / std::f32::consts::PI;
                        let _ = window.emit(
                            "imu-data",
                            serde_json::json!({
                                "accelX": 0,
                                "accelY": 0,
                                "accelZ": 0,
                                "gyroX": data.roll * to_deg,
                                "gyroY": data.pitch * to_deg,
                                "gyroZ": data.yaw * to_deg,
                            }),
                        );
                    }

                    MavMessage::RAW_IMU(data) => {
                        let _ = window.emit(
                            "imu-data",
                            serde_json::json!({
                                "accelX": data.xacc as f32 / 1000.0,
                                "accelY": data.yacc as f32 / 1000.0,
                                "accelZ": data.zacc as f32 / 1000.0,
                                "gyroX": data.xgyro as f32 * 0.001,
                                "gyroY": data.ygyro as f32 * 0.001,
                                "gyroZ": data.zgyro as f32 * 0.001,
                                "magX": data.xmag as f32 / 1000.0,
                                "magY": data.ymag as f32 / 1000.0,
                                "magZ": data.zmag as f32 / 1000.0,
                            }),
                        );
                    }

                    MavMessage::VFR_HUD(data) => {
                        let _ = window.emit(
                            "hud-data",
                            serde_json::json!({
                                "alt": data.alt,
                                "speed": data.groundspeed
                            }),
                        );
                    }

                    MavMessage::SYS_STATUS(data) => {
                        let _ = window.emit("battery-data", data.voltage_battery as f32 / 1000.0);
                    }

                    MavMessage::GPS_RAW_INT(data) => {
                        let _ = window.emit(
                            "gps-data",
                            serde_json::json!({
                                "lat": data.lat as f64 / 1e7,
                                "lon": data.lon as f64 / 1e7,
                                "alt": data.alt as f32 / 1000.0,
                                "sats": data.satellites_visible
                            }),
                        );
                    }

                    MavMessage::HEARTBEAT(_) => {
                        let _ = window.emit("status", "Drone Connected (Heartbeat)");
                    }

                    MavMessage::RAW_PRESSURE(data) => {
                        let _ = window.emit(
                            "pressure-data",
                            serde_json::json!({
                                "pressure": data.press_abs as f32 / 1000.0,
                                "temperature": data.temperature as f32 / 1000.0
                            }),
                        );
                    }

                    _ => {}
                }
            }

            std::thread::sleep(Duration::from_millis(50));
        }
    });

    Ok(())
}

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
            let header = mavlink::MavHeader::default();

            let request =
                MavMessage::REQUEST_DATA_STREAM(mavlink::common::REQUEST_DATA_STREAM_DATA {
                    req_stream_id: 0,
                    req_message_rate: 10,
                    target_system: 1,
                    target_component: 1,
                    start_stop: 0,
                });

            let _ = lock.as_ref().unwrap().send(&header, &request);
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
            disconnect_drone,
            start_telemetry_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
