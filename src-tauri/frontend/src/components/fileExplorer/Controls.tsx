"use client";

import React, { useState } from 'react';
import { BsDeviceHddFill, BsArrowLeft, BsHouseFill, BsX } from "react-icons/bs";
import { Tooltip } from '@nextui-org/tooltip';
import {
    listFilesInCurrentDirectory,
    changeDirectory,
    goToParentDirectory,
    getDirectoryHierarchy,
    listDrives,
    DriveInfo,
    goToHomeDirectory,
    FileInfo,
    DirectoryHierarchy,
} from '../../services/tauriService';

interface ControlsProps {
    setFiles: (files: FileInfo[]) => void;
    setHierarchy: (hierarchy: DirectoryHierarchy[]) => void;
}

export default function Controls({ setFiles, setHierarchy }: ControlsProps) {
    const [showDrives, setShowDrives] = useState(false);
    const [drives, setDrives] = useState<DriveInfo[]>([]);

    const handleGoUp = async () => {
        await goToParentDirectory();
        const newFiles = await listFilesInCurrentDirectory();
        const newHierarchy = await getDirectoryHierarchy();

        setFiles(newFiles);
        setHierarchy(newHierarchy);
        setShowDrives(false); // Hide drives after going up
    };

    const handleGoHome = async () => {
        await goToHomeDirectory();
        const newFiles = await listFilesInCurrentDirectory();
        const newHierarchy = await getDirectoryHierarchy();

        setFiles(newFiles);
        setHierarchy(newHierarchy);
        setShowDrives(false); // Hide drives after going home
    }

    const handleListDrives = async () => {
        setShowDrives(!showDrives); // Show the drives list
        const drives = await listDrives();
        setDrives(drives);
    };

    const handleDirectoryClick = async (path: string) => {
        await changeDirectory(path);
        const newFiles = await listFilesInCurrentDirectory();
        const newHierarchy = await getDirectoryHierarchy();

        setFiles(newFiles);
        //setCurrentPath(newPath);
        setHierarchy(newHierarchy);
        setShowDrives(false); // Hide drives after changing directory
    };

    return (
        <>
            {showDrives && <ControlsDriveList handleDirectoryClick={handleDirectoryClick} handleListDrives={handleListDrives} drives={drives} />}
            <div className="flex text-2xl font-bold pl-2 py-3 text-dir bg-white bg-opacity-30">
                <ControlsButtonBack handleGoUp={handleGoUp} />
                <ControlsButtonHome handleGoHome={handleGoHome} />
                <ControlsButtonDrives handleListDrives={handleListDrives} showDrives={showDrives} />
            </div>
        </>
    );
}

interface ControlsButtonBackProps {
    handleGoUp: () => void;
}

function ControlsButtonBack({ handleGoUp }: ControlsButtonBackProps) {
    return (
        <Tooltip content="Zurück" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline mr-2 cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoUp}
            >
                <BsArrowLeft />
            </div>
        </Tooltip>
    );
}

interface ControlsButtonHomeProps {
    handleGoHome: () => void;
}

function ControlsButtonHome({ handleGoHome }: ControlsButtonHomeProps) {
    return (
        <Tooltip content="Zum Home Verzeichnis" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline mr-2 cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoHome}
            >
                <BsHouseFill />
            </div>
        </Tooltip>
    );
}

interface ControlsButtonDrivesProps {
    handleListDrives: () => void;
    showDrives: boolean;
}

function ControlsButtonDrives({ handleListDrives, showDrives }: ControlsButtonDrivesProps) {

    return (
        <Tooltip content="Laufwerke anzeigen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`inline mr-2 cursor-pointer ${showDrives ? 'text-controls-300 hover:text-controls-200' : 'text-controls-100 hover:text-controls-200'}`}
                onClick={handleListDrives}
            >
                <BsDeviceHddFill />
            </div>
        </Tooltip>
    );
}

interface controlsDriveList {
    handleDirectoryClick: (path: string) => void;
    handleListDrives: () => void;
    drives: DriveInfo[];
}

function ControlsDriveList({ drives, handleDirectoryClick, handleListDrives }: controlsDriveList) {
    return (
        <div className='glass-card'>
            <h2 className="flex justify-between text-lg font-bold px-2 py-1">
                <span>Laufwerke</span>
                <span onClick={handleListDrives}>
                    <Tooltip content="Schließen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
                        <BsX className='h-6 w-6 inline hover:cursor-pointer' />
                    </Tooltip>
                </span>
            </h2>
            <ul className='flex-col w-full max-h-full overflow-x-hidden flex-grow'>
                {drives.map((drive, index) => (
                    <li
                        key={drive.letter}
                        className={`py-1 pl-2 flex cursor-pointer break-all text-md
                            ${index % 2 === 0 ? 'bg-white bg-opacity-0' : 'bg-white bg-opacity-10'}
                            hover:text-dir hover:bg-white-200 hover:bg-opacity-40 transition-colors duration-200 glass-card-border-top`}
                        onClick={() => handleDirectoryClick(drive.letter)}
                    >
                        <span>
                            <BsDeviceHddFill className='align-text-top h-5 w-5 text-dir inline mr-2' />
                            {drive.letter} {drive.name && `(${drive.name})`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}