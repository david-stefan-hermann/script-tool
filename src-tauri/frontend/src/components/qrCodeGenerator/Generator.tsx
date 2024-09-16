"use client";

import { useState } from "react";
import InfoMessage from "../common/InfoMessage";
import GlassCard from "../layout/GlassCard";
import ErrorMessage from "../common/ErrorMessage";
import { AnimatedButton } from "../ui/AnimatedButton";
import { generateQrCode, QrCodeResponse, saveQrCode } from "@/services/tauriService";
import { save } from '@tauri-apps/api/dialog';

export default function Generator() {
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [qrResponse, setQrResponse] = useState<QrCodeResponse | null>(null);

    function handleGenerateQrCode() {
        setError(null);

        if (qrValue === null || qrValue === '') {
            setError("Bitte gib einen Text oder eine Webseite ein.");
            return;
        }

        setQrResponse(null);

        if (qrValue) {
            generateQrCode(qrValue)
                .then((response) => {
                    console.log("QR Code generated successfully");
                    setQrResponse(response);
                })
                .catch((err) => {
                    console.error("Failed to generate QR Code:", err);
                    setError("Failed to generate QR Code: " + err);
                });
        }
    }

    const handleDownloadQrCode = async () => {
        if (qrResponse?.base64_image) {
            try {
                const filePath = await save({
                    defaultPath: sanitizeString(qrResponse.qr_value) + '.svg',
                    filters: [{ name: 'SVG', extensions: ['svg'] }],
                });

                if (filePath) {
                    saveQrCode(filePath, qrResponse.base64_image);
                    console.log("QR Code saved successfully");
                }
            } catch (err) {
                console.error("Failed to save QR Code:", err);
                setError("Failed to save QR Code: " + err);
            }
        }
    };

    return (
        <GlassCard title='Generator' image='/styling/backsplash/slots.jpg'>
            <div className="flex flex-col gap-2 p-2">
                <InfoMessage message='Gib den Text oder die Webseite ein, die zu einem QR Code umgewandelt werden soll.' />

                <input
                    type="text"
                    placeholder='Text oder Webseite'
                    value={qrValue !== null ? qrValue : ''}
                    onChange={(e) => setQrValue(e.target.value)}
                    className="border rounded px-2 py-1"
                />

                {error && <ErrorMessage message={error}></ErrorMessage>}
                <AnimatedButton text="Generieren" onClick={() => handleGenerateQrCode()} image='/styling/buttons/button-purple.jpg' />
                {qrResponse && <InfoMessage message={`QR Code wurde erfolgreich generiert für: ${qrResponse.qr_value}`} />}
                {qrResponse && <AnimatedButton text="Download" onClick={() => handleDownloadQrCode()} image='/styling/buttons/button-blue.jpg' />}
            </div>
        </GlassCard>
    );
}

/**
 * Sanitizes a string by removing unwanted characters and replacing spaces with underscores.
 * @param {string} input - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitizeString(input: string): string {
    // Remove any unwanted characters (e.g., special characters) and replace spaces with underscores
    return input.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
}