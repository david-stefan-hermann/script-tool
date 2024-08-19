"use client";

import { useEffect, useState } from 'react';
import {
    listFilesInCurrentDirectory,
    FileInfo,
    getCurrentPath,
} from '../../services/tauriService';
import File from './File';
import { listen } from '@tauri-apps/api/event';

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
        <div className="w-full h-full flex flex-col bg-white">
            <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Vorschau</h1>
            <span className='p-2 bg-gray-200'>
                {path}
            </span>
            <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow bg-gray-50 text-md">
                {files.map((file, index) => (
                    <>{file.is_video &&
                        <File index={index} file={file} onClickFunction={() => { }} />
                    }</>
                ))}
            </ul >
        </div>
    );
}
