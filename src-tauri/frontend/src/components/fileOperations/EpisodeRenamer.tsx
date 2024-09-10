"use client";

import React, { useEffect, useState } from 'react';
import { renameEpisodesWithTitles, getCurrentEpisodeNames } from '../../services/tauriService'; // Adjust the import path as necessary
import { listen } from '@tauri-apps/api/event'; // Import the event listener

export default function EpisodeRenamer() {
    const [episodeTitles, setEpisodeTitles] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Function to fetch and set current episode titles
    async function fetchCurrentEpisodes() {
        try {
            const currentTitles = await getCurrentEpisodeNames();
            setEpisodeTitles(currentTitles.join('\n')); // Pre-fill text area with the episode titles
        } catch (err) {
            console.error("Failed to load current episode names:", err);
            setError("Failed to load current episode names.");
        }
    }

    // Pre-populate the text area with current episode names on component load
    useEffect(() => {
        fetchCurrentEpisodes(); // Reload the current episode names

        const unlisten = listen<string>('directory-changed', async (event) => {
            fetchCurrentEpisodes(); // Reload the current episode names
        });

        const unlistenTriggerReload = listen<string>('trigger-reload', async (event) => {
            fetchCurrentEpisodes(); // Reload the current episode names
        });

        return () => {
            unlisten.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
            unlistenTriggerReload.then((fn) => fn());
        };
    }, []);

    // Function to handle renaming episodes
    function handleRename() {
        setError(null);
        const titles = episodeTitles.split('\n').map(title => title.trim());
        renameEpisodesWithTitles(titles)
            .then(() => {
                console.log("Files renamed successfully");
            })
            .catch((err) => {
                console.error("Failed to rename files:", err);
                setError("Failed to rename files: " + err);
            });
    }

    return (
        <div className="w-full flex flex-col bg-white h-full">
            <h1 className="text-lg font-bold bg-gray-200 pl-2 py-1">Episoden Umbenennen</h1>
            <div className="flex flex-col gap-2 p-2 h-full">
                <div className="flex flex-row flex-grow">
                    <textarea
                        style={{ whiteSpace: 'pre', overflowY: 'auto',}}
                        value={episodeTitles}
                        onChange={(e) => setEpisodeTitles(e.target.value)}
                        placeholder="Episodentitel (jede Zeile ist eine Episode)"
                        className="border rounded px-2 py-1 font-mono w-full"
                    />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <button onClick={handleRename} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Episoden umbenennen
                </button>
            </div>
        </div>
    );
}
