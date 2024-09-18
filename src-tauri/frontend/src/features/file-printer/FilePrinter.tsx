"use client";

import { useEffect, useState } from 'react';
import { FileInfo } from '@/services/tauriService';
import File from '@/features/fileExplorer/File';
import React from 'react';
import GlassCard from '@/components/layout/GlassCard';

declare global {
    interface Window {
        initialData: FileInfo[];
    }
}

export default function FilePrinter() {
    const [files, setFiles] = useState<FileInfo[]>([]);

    useEffect(() => {
        // Read the initial data from the window object
        if (window.initialData) {
            console.log(window.initialData);
            setFiles(window.initialData);
        }
    }, []);

    return (
        <GlassCard fullHeight title='Vorschau' image='/styling/backsplash/orange.jpg'>
            <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow text-md">
                {files.map((file, index) => (
                    <React.Fragment key={index}>
                        <File index={index} file={file} onClickFunction={() => { }} inactive />
                    </React.Fragment>
                ))}
            </ul >
        </GlassCard>
    );
}
