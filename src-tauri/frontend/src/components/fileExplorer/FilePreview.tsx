"use client";

import { useEffect, useState } from 'react';
import {
    listFilesInCurrentDirectory,
    FileInfo,
    getCurrentPath,
} from '../../services/tauriService';
import File from './File';
import { listen } from '@tauri-apps/api/event';
import React from 'react';
import { BsDeviceHddFill } from 'react-icons/bs';
import GlassCard from '../stylingComponents/GlassCard';

export default function FilePreview() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [path, setPath] = useState<string>('');

    useEffect(() => {
        async function loadInitialData() {
            const initialFiles = await listFilesInCurrentDirectory();
            const newPath = await getCurrentPath();

            setFiles(initialFiles);
            setPath(newPath);
        }

        loadInitialData();
    }, []);

    useEffect(() => {
        const unlisten = listen<string>('directory-changed', async (event) => {
            const files = await listFilesInCurrentDirectory();
            const newPath = await getCurrentPath();

            setFiles(files);
            setPath(newPath);
        });

        const unlistenTriggerReload = listen<string>('trigger-reload', async (event) => {
            const files = await listFilesInCurrentDirectory();

            setFiles(files);
        });

        return () => {
            unlisten.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
            unlistenTriggerReload.then((fn) => fn());
        };
    }, []);

    return (
        <GlassCard className='h-full' title='Vorschau' image='/styling/backsplash/orange.jpg'>
            <span className='p-2 bg-white bg-opacity-30'>
                <BsDeviceHddFill className="align-text-top h-5 w-5 text-dir inline mr-1" />{path}
            </span>
            <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow text-md">
                {files.map((file, index) => (
                    <React.Fragment key={index}>{file.is_video &&
                        <File index={index} file={file} onClickFunction={() => { }} />
                    }</React.Fragment>
                ))}
            </ul >
        </GlassCard>
    );
}
