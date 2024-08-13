"use client"

import {
    listFilesInCurrentDirectory,
    changeDirectory,
    getDirectoryHierarchy,
    FileInfo,
    DirectoryHierarchy,
    getCurrentPath,
    renameFilesInDirectory,
} from '../../services/tauriService';
import React, { useState } from 'react';

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
        <div className="w-full flex flex-col bg-white">
            <h1 className="flex text-lg font-bold bg-gray-200 pl-2 py-1">Titel Umbenennen</h1>
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
                <button onClick={handleRename} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Umbenennen
                </button>
            </div>
        </div>
    );
}
