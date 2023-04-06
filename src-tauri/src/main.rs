// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use std::thread;

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, Manager, WindowEvent, Window, UserAttentionType};

extern crate hidapi;

const CORE_IDENTIFIER: &'static str = "Tile Core";

#[derive(Clone, serde::Serialize)]
struct ChangeConnectionPayload {
    product_id: u16,
    vendor_id: u16,
    connected: bool,
}

#[derive(Clone, serde::Serialize)]
struct NetworkRequestPayload {
    product_id: u16,
    vendor_id: u16,
}

#[derive(Clone, serde::Serialize)]
struct HardwareReportPayload {
    tile_type: u8,
    product_id: u16,
    vendor_id: u16,
    hardware_id: String,
    network_id: u8,
}

#[derive(Clone, serde::Serialize)]
struct NeighboursPayload {
    product_id: u16,
    vendor_id: u16,
    network_id: u8,
    neighbours: Vec<String>,
}

#[tauri::command]
fn get_connected_cores() -> Vec<(u16, u16)> {
    let hid_api = hidapi::HidApi::new().unwrap();

    // list of cores that have name CORE_IDENTIFIER
    let cores: Vec<(u16, u16)> = hid_api.device_list()
        .filter(|device| device.product_string().unwrap().to_string() == CORE_IDENTIFIER)
        .map(|device| (device.product_id(), device.vendor_id()))
        .collect();

    cores
}

#[tauri::command]
fn send_network_id(product_id: u16, vendor_id: u16, network_id: u8) {
    let payload = &[network_id];
    send_data_packet(product_id, vendor_id, 170, network_id, payload);
}

#[tauri::command]
fn reset_network_id(product_id: u16, vendor_id: u16, network_id: u8) {
    send_data_packet(product_id, vendor_id, 204, network_id, &[]);
}

fn main() {
    tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
    .setup(setup)
    .system_tray(create_system_tray())
    .on_system_tray_event(on_system_tray_event)
    .invoke_handler(tauri::generate_handler![get_connected_cores, send_network_id, reset_network_id])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();
    let main_window = app.get_window("main").unwrap();

    // setup window events
    main_window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();

            for (window_name, window) in handle.windows() {
                if window_name == "main" {
                    window.minimize().expect("failed to minimize main window");
                    window.hide().expect("failed to close main window");
                    continue;
                }
            }
        }
    });

    // track new devices
    let cloned_window = main_window.clone();
    thread::spawn(move || {
        track_cores(cloned_window);
    });

    // listen for new network ids
    app.listen_global("set-network-id", |event| {
        println!("got set-network-id with payload {:?}", event.payload());
    });
    println!("setup complete");

    Ok(())
}

fn create_system_tray() -> SystemTray {
    let open = CustomMenuItem::new("open".to_string(), "Open");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn on_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            show_window(&app.get_window("main").unwrap());
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "open" => {
                show_window(&app.get_window("main").unwrap());
            }
            "hide" => {
                app.get_window("main").unwrap().hide().expect("error when hiding window");
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn show_window(window: &Window) {
    window.request_user_attention(Some(UserAttentionType::Informational)).expect("error when requesting user attention");
    window.show().expect("error when showing window");
    window.set_focus().expect("error when setting focus");
}

fn track_cores(window: Window) {
    let mut api = hidapi::HidApi::new().unwrap();
    let mut tracked_cores: Vec<(u16, u16)> = Vec::new();

    loop {
        api.refresh_devices().unwrap();
        let mut cores: Vec<(u16, u16)> = Vec::new();
        for device in api.device_list() {
            if device.product_string().unwrap().to_string() == CORE_IDENTIFIER {
                let pid = device.product_id();
                let vid = device.vendor_id();
                cores.push((pid, vid));
            }
        }
        let removed_cores: Vec<(u16, u16)> = tracked_cores.iter().filter(|core| !cores.contains(core)).map(|core| *core).collect();
        let added_cores: Vec<(u16, u16)> = cores.iter().filter(|core| !tracked_cores.contains(core)).map(|core| *core).collect();

        for core in removed_cores {
            println!("removed core: {:?}", core);
            window.emit_all("connection-change", ChangeConnectionPayload{ product_id: core.0, vendor_id: core.1, connected: false }).unwrap();
        }
        for core in added_cores {
            println!("added core: {:?}", core);
            window.emit_all("connection-change", ChangeConnectionPayload{ product_id: core.0, vendor_id: core.1, connected: true }).unwrap();
            let cloned_window = window.clone();
            thread::spawn(move || {
                receive_core_data(cloned_window, core.0, core.1);
            });
        }
        tracked_cores = cores;
        thread::sleep(Duration::from_millis(1000));
    }
}

fn receive_core_data(window: Window, pid: u16, vid: u16) {
    let api = hidapi::HidApi::new().unwrap();
    let device = api.open(vid, pid).unwrap();

    // thread::sleep(Duration::from_millis(5000));

    // send_data_packet(pid, vid, 255, 0, &[0]);

    let mut buf: [u8; 64] = [0; 64];
    let mut count = 0;
    loop {
        if (count % 100) == 0 {
            let temp = api.open(vid, pid);
            if temp.is_err() {
                println!("core disconnected: {:?} {:?}", pid, vid);
                break;
            }
        }
        let res = device.read(&mut buf);
        if res.is_ok() {
            let cloned_window = window.clone();
            process_data(cloned_window, pid, vid, &buf);
        }
        count += 1;
    }
}

fn process_data(window: Window, pid: u16, vid: u16, data: &[u8; 64]) {
    println!("received data: {:?}", data);

    let data_type = data[0];
    let sender_network_id = data[2];
    let data_length = data[3];
    let payload = &data[4..4 + data_length as usize];

    match data_type {
        17 => { // general data packet
            process_data_packet(pid, vid, sender_network_id, payload);
        },
        85 => { // give me a network id
            window.emit_all("request-network-id", NetworkRequestPayload{vendor_id: vid, product_id: pid}).unwrap();
            println!("request network id");
        },
        102 => { // report hardware id
            process_hardware_report(window.clone(), pid, vid, sender_network_id, payload);
            println!("report hardware id");
        },
        153 => { // report all neighbours
            // BUG when plugging in two, one of them has the network id 0 even though it's correct in the routing table
            println!("network id of sender: {}", sender_network_id);
            let neighbours = payload.iter().map(|byte| byte.to_string()).collect::<Vec<String>>();
            window.emit_all("report-neighbours", NeighboursPayload{ product_id: pid, vendor_id: vid, network_id: sender_network_id, neighbours }).unwrap();
        },
        // 187 => println!("Change Hardware-ID"), // change hardware id
        // 221 => println!("Reset All / Factory Reset"), // reset all / factory reset
        _ => println!("unknown data type: {}", data_type)
    }
}

fn create_data_packet(data_type: u8, network_id: u8, payload: &[u8]) -> [u8; 65] {
    let mut data: [u8; 65] = [0; 65];
    data[0] = 0u8;
    data[1] = data_type;
    data[2] = network_id;
    data[3] = 1;
    data[4] = payload.len() as u8;
    for i in 0..payload.len() {
        data[5 + i] = payload[i];
    }

    data
}

fn send_data_packet(pid: u16, vid: u16, data_type: u8, network_id: u8, payload: &[u8]) {
    let data = create_data_packet(data_type, network_id, payload);
    let api = hidapi::HidApi::new().unwrap();
    let device = api.open(vid, pid).unwrap();
    let res = device.write(&data).unwrap();
    println!("Wrote: {:?} byte(s)", res);
}

fn process_hardware_report(window: Window, pid: u16, vid: u16, network_id: u8, payload: &[u8]) {
    // last is type
    let tile_type = payload[payload.len() - 1];
    let hardware_id = payload[0..payload.len() - 1].iter().map(|byte| byte.to_string()).collect::<Vec<String>>().join(".");
    println!("payload: {:?}", payload);
    println!("hardware id: {}", hardware_id);
    println!("tile type: {}", tile_type);
    window.emit_all("report-hardware-id", HardwareReportPayload{ hardware_id, tile_type, product_id: pid, vendor_id: vid, network_id }).unwrap();
}

fn process_data_packet(pid: u16, vid: u16, network_id: u8, payload: &[u8]) {
}