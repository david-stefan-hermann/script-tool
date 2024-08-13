"use client";

import React, { useState } from 'react';
import { adjustEpisodeNumbersInDirectory } from '../../services/tauriService'; // Adjust import paths as necessary

export default function EpisodeNumberAdjuster() {
    const [adjustmentValue, setAdjustmentValue] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleAdjust() {
        setError(null);
        if (adjustmentValue === null) {
            setError("Bitte gib eine Zahl ein.");
            return;
        }

        setError(null);
        adjustEpisodeNumbersInDirectory(adjustmentValue)
            .then(() => {
                console.log("Episode numbers adjusted successfully");
            })
            .catch((err) => {
                console.error("Failed to adjust episode numbers:", err);
                setError("Failed to adjust episode numbers: " + err);
            });
    }

    return (
        <div className="w-full flex flex-col bg-white">
            <h1 className="flex text-lg font-bold bg-gray-200 pl-2 py-1">Episodennummer anpassen</h1>
            <div className="flex flex-col gap-2 p-2">
                <input
                    type="number"
                    value={adjustmentValue !== null ? adjustmentValue : ''}
                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                    placeholder="Gib eine Zahl ein (z.B. 1 oder -1)"
                    className="border rounded px-2 py-1"
                />
                {error && <div className="text-red-500">{error}</div>}
                <button onClick={handleAdjust} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Adjust Episode Numbers
                </button>
            </div>
        </div>
    );
}