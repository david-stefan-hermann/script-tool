"use client";

import { useEffect, useState } from 'react';
import { FileInfo, saveFileToFolder } from '@/services/tauriService';
import File from '@/features/fileExplorer/File';
import React from 'react';
import GlassCard from '@/components/layout/GlassCard';
import ErrorMessage from '@/components/common/ErrorMessage';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { save } from '@tauri-apps/api/dialog';

declare global {
    interface Window {
        initialData?: InitialData;
    }
}

interface InitialData {
    filesData: FileInfo[];
    fileName: string;
}

export default function FilePrinter() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        // Read the initial data from the window object
        if (window.initialData) {
            console.log(window.initialData);
            setFiles(window.initialData.filesData);
            setFileName(window.initialData.fileName);
        } else {
            setError('No files to display found.');
        }
    }, []);

    async function downloadFile() {
        try {
            const selectedFolder = await save({
                defaultPath: sanitizeString(fileName) + '.txt',
                filters: [{ name: 'TXT', extensions: ['txt'] }],
            });

            if (selectedFolder) {
                saveFileToFolder(selectedFolder, files);
            }
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    return (
        <GlassCard fullHeight title='Vorschau' image='/styling/backsplash/orange.jpg'>
            <ul className="flex-col w-full overflow-x-hidden flex-grow text-md">
                {files?.map((file, index) => (
                    <React.Fragment key={index}>
                        <File index={index} file={file} onClickFunction={() => { }} inactive />
                    </React.Fragment>
                ))}
            </ul >
            {/* Error Display */}
            {error && <ErrorMessage message={error}></ErrorMessage>}

            {/* Fetch Episode Titles Button */}
            <div className='flex flex-row w-full justify-center glass-card-border-top'>
                <div className='basis-1/2'>
                    <AnimatedButton download text="Download" onClick={downloadFile} image='/styling/buttons/button-purple.jpg' />
                </div>
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
    return input.replace(/[^a-zA-Z0-9_ ]/g, '').replace(/\s+/g, '_');
}