"use client";

import React, { useState } from 'react';
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
} from '../../../services/tauriService';
import ControlsDriveList from './ControlsDriveList';
import ControlsButtonDrives from './ControlsButtonDrives';
import ControlsButtonHome from './ControlsButtonHome';
import ControlsButtonBack from './ControlsButtonBack';

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
