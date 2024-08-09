"use client"

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { BsDeviceHdd, BsArrowLeft, BsHouse } from "react-icons/bs";
import { Tooltip } from '@nextui-org/tooltip';

interface ControlsProps {
    setPath: (path: string) => void;
    path: string | null;
}

interface DriveInfo {
    letter: string;
    name: string;
}

interface DriveListResponse extends Array<DriveInfo> { }

export default function Controls({ setPath, path }: ControlsProps) {
    const [showDrives, setShowDrives] = useState<boolean>(false);
    const [drives, setDrives] = useState<DriveListResponse>([]);

    const handleGoBack = async (path: string | null) => {
        setShowDrives(false);
        if (!path) return;
        const result = await invoke<string>('get_parent_directory', { path });
        result && setPath(result);
    }

    const handleGoHome = () => {
        setShowDrives(false);
        setPath("");
    }

    const handleDirectoryClick = (newPath: string) => {
        setShowDrives(false);
        setPath(newPath);
    };

    const handleListDrives = async () => {
        setShowDrives(!showDrives);
        if (showDrives) return;

        try {
            const result = await invoke<DriveListResponse>('list_drives');
            setDrives(result);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            {showDrives && (
                <>
                    <h1 className="flex flex-col text-lg font-bold bg-gray-200 border-t-1 border-gray-300 pl-2 py-2 color-blue-500">
                        Drives
                    </h1>
                    {drives.map((drive, index) => (
                        <button
                            key={index}
                            className={`py-1 pl-4 flex cursor-pointer break-all
                                ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                                } hover:bg-gray-200 transition-colors duration-200`}

                            onClick={() => handleDirectoryClick(drive.letter)}
                        >
                            <span key={index} className="text-sm text-blue-500">
                                {drive.letter} {drive.name && `(${drive.name})`}
                            </span>
                        </button>
                    ))}
                </>
            )}
            <h1 className="flex text-2xl font-bold bg-gray-300 pl-2 py-2 color-blue-500">
                <Tooltip content="Zurück" placement="top" className='bg-white px-2 rounded border-1 border-gray-100'>
                    <div
                        className="h-6 w-6 text-red-500 inline mr-2 cursor-pointer hover:text-red-600 active:text-green-500"
                    >
                        <BsArrowLeft
                            onClick={() => handleGoBack(path)} />
                    </div>
                </Tooltip>
                <Tooltip content="Home" placement="top" className='bg-white px-2 rounded border-1 border-gray-100'>
                    <div
                        className="h-6 w-6 text-red-500 inline mr-2 cursor-pointer hover:text-red-600 active:text-green-500"
                    >
                        <BsHouse
                            onClick={() => { handleGoHome() }} />
                    </div>
                </Tooltip>
                <Tooltip content="Zeige Laufwerke" placement="top" className='bg-white px-2 rounded border-1 border-gray-100'>
                    <div
                        className={`inline mr-2 cursor-pointer ${showDrives ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                    >

                        <BsDeviceHdd
                            onClick={() => { handleListDrives() }} />
                    </div>
                </Tooltip >
            </h1 >
        </>
    );

}