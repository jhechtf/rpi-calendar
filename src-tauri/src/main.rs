// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::TcpListener;

/// Binds a free localhost port, waits for a single OAuth redirect request in a
/// background thread, then emits the full callback URL as the `oauth-callback`
/// event back to the window.  Returns the port number so the frontend can
/// build the `redirect_uri` parameter.
#[tauri::command]
fn start_oauth_server(window: tauri::Window) -> Result<u16, String> {
    let listener =
        TcpListener::bind("127.0.0.1:0").map_err(|e| format!("bind failed: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("local_addr failed: {e}"))?
        .port();

    std::thread::spawn(move || {
        // Block until the browser hits the redirect URI.
        let Ok((mut stream, _)) = listener.accept() else {
            return;
        };

        let mut buf = vec![0u8; 8192];
        let n = stream.read(&mut buf).unwrap_or(0);
        let request = String::from_utf8_lossy(&buf[..n]);

        // Parse "GET /path?query HTTP/1.1" → full callback URL
        let callback_url = request
            .lines()
            .next()
            .and_then(|line| line.split_whitespace().nth(1))
            .map(|path| format!("http://localhost:{port}{path}"))
            .unwrap_or_default();

        // Tell the browser it can close the tab.
        let body = "\
            <html><head><title>rpi-calendar</title></head>\
            <body style='font-family:sans-serif;text-align:center;padding:60px'>\
            <h2>&#10003; Authorisation complete</h2>\
            <p>You can close this tab and return to the app.</p>\
            <script>setTimeout(() => window.close(), 4000)</script>
            </body></html>";
        let _ = stream.write_all(
            format!(
                "HTTP/1.1 200 OK\r\n\
                 Content-Type: text/html; charset=utf-8\r\n\
                 Content-Length: {}\r\n\
                 Connection: close\r\n\r\n{}",
                body.len(),
                body
            )
            .as_bytes(),
        );

        let _ = window.emit("oauth-callback", callback_url);
    });

    Ok(port)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_oauth_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
