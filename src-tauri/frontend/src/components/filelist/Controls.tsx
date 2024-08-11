"use client";

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

export default function Controls({ setPath, path }: ControlsProps) {
    const [showDrives, setShowDrives] = useState(false);
    const [drives, setDrives] = useState<DriveInfo[]>([]);

    return (
        <div>
            <ControlsDriveList setShowDrives={setShowDrives} setPath={setPath} showDrives={showDrives} drives={drives} />
            <div className="flex text-2xl font-bold bg-gray-300 pl-2 py-2 text-blue-500">
                <ControlsButtonBack setShowDrives={setShowDrives} setPath={setPath} path={path} />
                <ControlsButtonHome setShowDrives={setShowDrives} setPath={setPath} />
                <ControlsButtonDrives setShowDrives={setShowDrives} showDrives={showDrives} setDrives={setDrives} />
            </div>
        </div>
    );
}

interface controlsButtonBackProps {
    setShowDrives: (showDrives: boolean) => void;
    setPath: (path: string) => void;
    path: string | null;
}

function ControlsButtonBack({ setShowDrives, setPath, path }: controlsButtonBackProps) {
    const handleGoBack = async () => {
        setShowDrives(false);
        if (path) {
            const result = await invoke<string>('get_parent_directory', { path });
            if (result) setPath(result);
        }
    };
    return (
        <Tooltip content="Back" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-red-500 inline mr-2 cursor-pointer hover:text-red-600 active:text-green-500"
                onClick={handleGoBack}
            >
                <BsArrowLeft />
            </div>
        </Tooltip>
    );
}

interface controlsButtonHomeProps {
    setShowDrives: (showDrives: boolean) => void;
    setPath: (path: string) => void;
}

function ControlsButtonHome({ setShowDrives, setPath }: controlsButtonHomeProps) {
    const handleGoHome = () => {
        setShowDrives(false);
        setPath("");
    };
    return (
        <Tooltip content="Home" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-red-500 inline mr-2 cursor-pointer hover:text-red-600 active:text-green-500"
                onClick={handleGoHome}
            >
                <BsHouse />
            </div>
        </Tooltip>
    );
}

interface controlsButtonDrivesProps {
    setShowDrives: (showDrives: boolean) => void;
    showDrives: boolean;
    setDrives: (drives: DriveInfo[]) => void;
}

function ControlsButtonDrives({ setShowDrives, showDrives, setDrives }: controlsButtonDrivesProps) {
    const handleListDrives = async () => {
        setShowDrives(!showDrives);
        if (!showDrives) {
            try {
                const result = await invoke<DriveInfo[]>('list_drives');
                setDrives(result);
            } catch (error) {
                console.error("Failed to list drives:", error);
            }
        }
    };
    return (
        <Tooltip content="Show Drives" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`inline mr-2 cursor-pointer ${showDrives ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                onClick={handleListDrives}
            >
                <BsDeviceHdd />
            </div>
        </Tooltip>
    );
}

interface controlsDriveList {
    setShowDrives: (showDrives: boolean) => void;
    setPath: (path: string) => void;
    showDrives: boolean;
    drives: DriveInfo[];
}

function ControlsDriveList({ setShowDrives, setPath, showDrives, drives }: controlsDriveList) {
    const handleDirectoryClick = (newPath: string) => {
        setShowDrives(false);
        setPath(newPath);
    };
    return (
        <>
            {showDrives && (
                <div>
                    <h1 className="flex flex-col text-lg font-bold bg-gray-200 border-t border-gray-300 pl-2 py-2 text-blue-500">
                        Drives
                    </h1>
                    {drives.map((drive, index) => (
                        <button
                            key={drive.letter}
                            className={`py-1 pl-4 flex cursor-pointer break-all transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-200`}
                            onClick={() => handleDirectoryClick(drive.letter)}
                        >
                            <span className="text-sm text-blue-500">
                                {drive.letter} {drive.name && `(${drive.name})`}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}