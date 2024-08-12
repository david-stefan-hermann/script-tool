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

export default function FileExplorer() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [hierarchy, setHierarchy] = useState<DirectoryHierarchy[]>([]);

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
        <div className="w-full h-full flex flex-col bg-white">
            <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Deteiexplorer</h1>

            <div className="flex items-center bg-gray-200 p-2">
                <BreadCrumbs onClickFunction={handleDirectoryClick} hierarchy={hierarchy} />
            </div>

            <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow bg-gray-50 text-md">
                {files.map((file, index) => (
                    <File index={index} file={file} onClickFunction={handleDirectoryClick} />
                ))}
            </ul >
            <Controls setFiles={setFiles} setHierarchy={setHierarchy} />
        </div>
    );
}
