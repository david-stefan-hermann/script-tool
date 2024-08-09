import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface BreadCrumbsProps {
    onClickFunction: (path: string) => void;
    path: string | null;
}

interface DirectoryHierarchy {
    full_path: string,
    dir_name: string,
}

interface HierarchyResponse extends Array<DirectoryHierarchy> {}

export default function BreadCrumbs({ onClickFunction, path }: BreadCrumbsProps) {
    const [directories, setDirectories] = useState<HierarchyResponse>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDirectories() {
            setError(null);
            console.log('fetching directories');
            try {
                const result = await invoke<HierarchyResponse>(path ? 'get_directory_hierarchy' : 'list_home_files', { path });
                console.log('cp', path);
                setDirectories(result);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unknown error');
            }
        }

        fetchDirectories();
    }, [path]);

    const handleDirectoryClick = (newPath: string) => {
        setError(null);
        onClickFunction(newPath);
    };

    const renderBreadcrumbs = () => {
        return (
            <div className="flex flex-wrap">
                {directories.slice().reverse().map((directory, index) => (
                    <div key={index} className="flex items-center">
                        <button
                            className="text-blue-500 hover:underline"
                            onClick={() => handleDirectoryClick(directory.full_path)}
                        >
                            {directory.dir_name}
                        </button>
                        <span className="mx-1">/</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex text-sm font-bold bg-gray-200 pl-2 py-2">
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex flex-wrap">
                {renderBreadcrumbs()}
            </div>
        </div>
    );
}