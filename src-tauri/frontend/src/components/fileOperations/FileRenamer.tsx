"use client";

import {
    renameFilesInDirectory,
} from '../../services/tauriService';
import React, { useState } from 'react';
import { AnimatedButton } from '../stylingComponents/AnimatedButton';

// Placeholder for your components
export default function FileRenamer() {
    const [searchString, setSearchString] = useState('');
    const [replaceString, setReplaceString] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleRename() {
        setError(null);
        renameFilesInDirectory(searchString, replaceString)
            .then(() => {
                console.log("Files renamed successfully");
            })
            .catch((err) => {
                console.error("Failed to rename files:", err);
                setError("Failed to rename files: " + err);
            });
    }

    return (
        <div className="w-full flex flex-col glass-card">
            <h1 className="flex md:text-2xl text-xl bg-center"
                style={{backgroundImage: "url('/styling/buttons/white.jpg')"}}>Titel Umbenennen</h1>
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
                {error && <div className="text-red-500">{error}</div>}
                <AnimatedButton text="Umbenennen" onClick={handleRename} image='/styling/buttons/button-purple.jpg' />
            </div>
        </div>
    );
}
