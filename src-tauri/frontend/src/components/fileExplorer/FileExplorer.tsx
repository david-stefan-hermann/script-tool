"use client";

import { useEffect, useState } from 'react';
import {
    listFilesInCurrentDirectory,
    changeDirectory,
    getDirectoryHierarchy,
    FileInfo,
    DirectoryHierarchy,
} from '../../services/tauriService';
import Controls from './Controls';
import File from './File';
import BreadCrumbs from './BreadCrumbs';
import { listen } from '@tauri-apps/api/event';
import GlassCard from '../stylingComponents/GlassCard';


export default function FileExplorer() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [hierarchy, setHierarchy] = useState<DirectoryHierarchy[]>([]);

    useEffect(() => {
        const unlisten = listen<string>('trigger-reload', async (event) => {
            const newFiles = await listFilesInCurrentDirectory();

            setFiles(newFiles);
        });

        return () => {
            unlisten.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
        };
    }, []);

    useEffect(() => {
        async function loadInitialData() {
            const initialFiles = await listFilesInCurrentDirectory();
            const hierarchy = await getDirectoryHierarchy();

            setFiles(initialFiles);
            setHierarchy(hierarchy);
        }

        loadInitialData();
    }, []);

    const handleDirectoryClick = async (path: string) => {
        await changeDirectory(path);
        const newFiles = await listFilesInCurrentDirectory();
        const newHierarchy = await getDirectoryHierarchy();

        setFiles(newFiles);
        setHierarchy(newHierarchy);
    };

    return (
        <GlassCard className='h-full' title='Dateiexplorer' image='/styling/buttons/blue2.jpg'>
            <div className="flex items-center p-2 bg-white bg-opacity-30">
                <BreadCrumbs onClickFunction={handleDirectoryClick} hierarchy={hierarchy} />
            </div>

            <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow text-md">
                {files.map((file, index) => (
                    <File key={index} index={index} file={file} onClickFunction={handleDirectoryClick} />
                ))}
            </ul >
            <Controls setFiles={setFiles} setHierarchy={setHierarchy} />
        </GlassCard>
    );
}
