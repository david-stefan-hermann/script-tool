"use client";

import React, { useEffect, useState } from 'react';
import { addTitlesToEpisodes, addTitlesToEpisodesPreview, getCurrentEpisodeNames, openEpisodeTitleWindow, focusMainWindow } from '@/services/tauriService'; // Adjust the import path as necessary
import { listen } from '@tauri-apps/api/event'; // Import the event listener
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/layout/GlassCard';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EpisodeRenamer() {
    const [episodeTitles, setEpisodeTitles] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Listen for the 'fetched_episodes' event emitted from the backend
        const unlisten = listen<{ episodeTitles: string[] }>('send_episodes', async (event) => {
            const episodeTitles = event.payload.episodeTitles

            // Check if episodeTitles is an array before joining
            if (Array.isArray(episodeTitles)) {
                const joinedTitles = episodeTitles.join('\n');
                setEpisodeTitles(joinedTitles);  // Set the state with the joined titles
                console.log("Received episode titles:", joinedTitles);
            } else {
                console.error('Expected an array, but got:', typeof episodeTitles, episodeTitles);
            }

            // Focus the window after receiving the episode titles
            focusMainWindow();
        });

        // Cleanup the event listener on component unmount
        return () => {
            unlisten.then((dispose) => dispose());
        };
    }, []);

    // Function to fetch and set current episode titles
    async function fetchCurrentEpisodes() {
        setError(null);
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
        addTitlesToEpisodes(titles)
            .then(() => {
                console.log("Files renamed successfully");
            })
            .catch((err) => {
                console.error("Failed to rename files:", err);
                setError("Failed to rename files: " + err);
            });
    }

    // Function to handle previewing new file names
    useEffect(() => {
        function handlePreview() {
            const titles = episodeTitles.split('\n').map(title => title.trim());
            addTitlesToEpisodesPreview(titles)
                .then(() => {
                    console.log("Preview successfull: Episode Renamer");
                })
                .catch((err) => {
                    console.error("Preview failed: Episode Renamer:", err);
                });
        }

        episodeTitles && handlePreview();
    }, [episodeTitles]);

    return (
        <GlassCard fullHeight title='Episoden Umbenennen' image='/styling/backsplash/green.jpg'>
            <div className="flex flex-col gap-2 p-2 h-full">
                <div className="flex flex-row flex-grow">
                    <textarea
                        style={{ whiteSpace: 'pre', overflowY: 'auto', }}
                        value={episodeTitles}
                        onChange={(e) => setEpisodeTitles(e.target.value)}
                        placeholder="Jede Zeile entspricht einer Episode"
                        className="border rounded px-2 py-1 font-mono w-full"
                    />
                </div>
                {error && <ErrorMessage message={error}></ErrorMessage>}
                <div className='flex flex-row w-full gap-2 justify-center'>
                    <AnimatedButton text="Titel laden" onClick={openEpisodeTitleWindow} image='/styling/buttons/button-blue.jpg' />
                    <AnimatedButton text="Umbenennen" onClick={handleRename} image='/styling/buttons/button-purple.jpg' />
                </div>
            </div>
        </GlassCard>
    );
}
