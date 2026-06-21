use crate::parser::{self};
use futures_util::StreamExt;
use tauri::{AppHandle, Emitter};
use tokio_tungstenite::connect_async;

#[tauri::command]
pub async fn websocket_connect(app: AppHandle) {
    println!("connect called from JS");
    let local_ip = "192.168.0.129";
    let telemetry_board_ip = "192.168.4.1";
    let url = format!("ws://{local_ip}:81");

    let (ws_stream, _response) = connect_async(url).await.expect("Failed to connect");
    println!("WebSocket handshake has been successfully completed");

    let (mut _write, read) = ws_stream.split();

    let read_future = read.for_each(|message| async {
        let data = message.unwrap().into_data();
        let raw_message = String::from_utf8(data.to_vec()).expect("Invalid UTF-8");
        println!("websocket read {raw_message}");
        if raw_message.len() > 0 {
            let parsed_message = parser::parse_message(raw_message);
            app.emit("telemetry-message", &parsed_message);
        }
    });

    read_future.await;
}
