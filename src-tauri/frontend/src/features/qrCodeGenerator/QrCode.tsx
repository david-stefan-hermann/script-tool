"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/layout/GlassCard";
import { listen } from "@tauri-apps/api/event";

export default function QrCode() {
    const [qrCode, setQrCode] = useState<string>('');

    useEffect(() => {
        const unlisten = listen<{ data: string }>('qr-code', async (event) => {
            const qrCode = event.payload.data;

            setQrCode(qrCode);
        });

        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);

    return (
        <GlassCard fullHeight title='QR Code' image='/styling/backsplash/port.jpg' bgClass="bg-center">
            <div className="flex flex-col flex h-full gap-2 p-2">
                {qrCode &&
                    <div
                        className="h-full bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(data:image/svg+xml;base64,${qrCode})` }}
                    ></div>
                }
            </div>
        </GlassCard>
    );
}