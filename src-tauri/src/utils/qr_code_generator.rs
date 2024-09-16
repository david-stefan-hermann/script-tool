use std::{fs::File, io::Write};

use base64::{engine::general_purpose, Engine as _};
use qrcode::{render::svg, QrCode};
use serde::Serialize;
use tauri::{command, Window};

#[derive(Serialize, Clone)]
pub struct QrCodePayload {
    event: String,
    data: String,
}

#[derive(Serialize)]
pub struct QrCodeResponse {
    qr_value: String,
    base64_image: String,
}

#[command]
pub async fn generate_qr_code<'a>(
    qr_value: &'a str,
    window: Window,
) -> Result<QrCodeResponse, String> {
    // Generate the QR code
    let code = QrCode::new(qr_value).map_err(|e| e.to_string())?;
    let image = code.render::<svg::Color>().build();

    // Encode the image as a base64 string
    let base64_image = general_purpose::STANDARD.encode(image);

    // Create the payload
    let payload = QrCodePayload {
        event: "qr-code".to_string(),
        data: base64_image.clone(),
    };

    // Emit the event directly to the frontend
    window
        .emit("qr-code", payload)
        .map_err(|e| format!("Failed to emit event: {:?}", e))?;

    // Return the qr_value and base64_image
    Ok(QrCodeResponse {
        qr_value: qr_value.to_string(),
        base64_image,
    })
}

#[command]
pub async fn save_qr_code(file_path: String, base64_image: String) -> Result<(), String> {
    // Decode the base64 string
    let binary_data = general_purpose::STANDARD
        .decode(base64_image)
        .map_err(|e| e.to_string())?;

    // Write the binary data to the specified file path
    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(&binary_data).map_err(|e| e.to_string())?;

    Ok(())
}
