"use client"

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const FileBrowser = () => {
    const [path, setPath] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (path) {
            fetchFiles(path);
        }
    }, [path]);

    const fetchFiles = async (directory: string) => {
        try {
            const files: string[] = await invoke('read_directory', { path: directory });
            setFiles(files);
            setError('');
        } catch (err) {
            setError('Failed to read directory');
        }
    };

    const handleOpenFileExplorer = async () => {
        try {
            const selectedPath: string = await invoke('open_file_explorer');
            setPath(selectedPath);
        } catch (err) {
            setError('Failed to open file explorer');
        }
    };

    const handleDirectoryClick = (directory: string) => {
        setPath(`${path}/${directory}`);
    };

    return (
        <div className="p-4">
            <button
                onClick={handleOpenFileExplorer}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Open File Explorer
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <ul className="mt-4">
                {files.map((file, index) => (
                    <li
                        key={index}
                        className="cursor-pointer hover:bg-gray-200 p-2"
                        onClick={() => handleDirectoryClick(file)}
                    >
                        {file}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileBrowser;