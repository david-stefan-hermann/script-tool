"use client";

import React, { useState } from 'react';
import { adjustEpisodeNumbersInDirectory } from '../../services/tauriService'; // Adjust import paths as necessary
import { AnimatedButton } from '../stylingComponents/AnimatedButton';
import GlassCard from '../stylingComponents/GlassCard';
import ErrorMessage from '../stylingComponents/ErrorMessage';

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
                setAdjustmentValue(null);
            })
            .catch((err) => {
                console.error("Failed to adjust episode numbers:", err);
                setError("Failed to adjust episode numbers: " + err);
            });
    }

    return (
        <GlassCard title='Episodennummer anpassen' image='/styling/backsplash/gray.jpg'>
            <div className="flex flex-col gap-2 p-2">
                <input
                    type="number"
                    value={adjustmentValue !== null ? adjustmentValue : ''}
                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                    placeholder="Gib eine Zahl ein (z.B. 1 oder -1)"
                    className="border rounded px-2 py-1"
                />
                {error && <ErrorMessage message={error}></ErrorMessage>}
                <AnimatedButton text="Anpassen" onClick={handleAdjust} image='/styling/buttons/button-purple.jpg' />
            </div>
        </GlassCard>
    );
}
