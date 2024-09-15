"use client";

import {
    searchAndReplace,
    searchAndReplacePreview,
    triggerRefresh,
} from '../../services/tauriService';
import React, { useEffect, useState } from 'react';
import { AnimatedButton } from '../ui/AnimatedButton';
import GlassCard from '../layout/GlassCard';
import ErrorMessage from '../common/ErrorMessage';

// Placeholder for your components
export default function FileRenamer() {
    const [searchString, setSearchString] = useState('');
    const [replaceString, setReplaceString] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleRename() {
        setError(null);
        searchAndReplace(searchString, replaceString)
            .then(() => {
                console.log("Files renamed successfully");
            })
            .catch((err) => {
                console.error("Failed to rename files:", err);
                setError("Failed to rename files: " + err);
            });
    }

    useEffect(() => {
        function handlePreview() {
            searchAndReplacePreview(searchString, replaceString)
                .then(() => {
                    console.log("Preview successfull: Search and Replace");
                })
                .catch((err) => {
                    console.error("Preview failed: Search and Replace:", err);
                });
        };
        searchString ? handlePreview() : triggerRefresh();
    }, [searchString, replaceString]);

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
