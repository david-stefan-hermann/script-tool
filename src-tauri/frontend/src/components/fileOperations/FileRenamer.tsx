"use client";

import {
    searchAndReplaceInDirectory,
} from '../../services/tauriService';
import React, { useState } from 'react';
import { AnimatedButton } from '../stylingComponents/AnimatedButton';
import GlassCard from '../stylingComponents/GlassCard';
import ErrorMessage from '../stylingComponents/ErrorMessage';

// Placeholder for your components
export default function FileRenamer() {
    const [searchString, setSearchString] = useState('');
    const [replaceString, setReplaceString] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleRename() {
        setError(null);
        searchAndReplaceInDirectory(searchString, replaceString)
            .then(() => {
                console.log("Files renamed successfully");
            })
            .catch((err) => {
                console.error("Failed to rename files:", err);
                setError("Failed to rename files: " + err);
            });
    }

    return (
        <GlassCard title='Titel umbenennen' image='/styling/backsplash/white.jpg'>
            <div className="flex flex-col gap-2 p-2">
                <input
                    type="text"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    placeholder="Suchen"
                    className="border rounded px-2 py-1"
                />
                <input
                    type="text"
                    value={replaceString}
                    onChange={(e) => setReplaceString(e.target.value)}
                    placeholder="Ersetzen"
                    className="border rounded px-2 py-1"
                />
                {error && <ErrorMessage message={error}></ErrorMessage>}
                <AnimatedButton text="Umbenennen" onClick={handleRename} image='/styling/buttons/button-purple.jpg' />
            </div>
        </GlassCard>
    );
}
