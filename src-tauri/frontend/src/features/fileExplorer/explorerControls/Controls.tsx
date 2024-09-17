"use client";

import React, { useEffect, useState } from 'react';
import {
    changeDirectory,
} from '../../../services/tauriService';
import ControlsDriveList from './ControlsDriveList';
import ControlsButtonDrives from './ControlsButtonDrives';
import ControlsButtonHome from './ControlsButtonHome';
import ControlsButtonBack from './ControlsButtonBack';
import { listen } from '@tauri-apps/api/event';
import ControlsButtonSelectPath from './ControlsButtonSelectPath';
import ControlsButtonExplorer from './ControlsButtonExplorer';
import ControlsButtonTerminal from './ControlsButtonTerminal';
import ControlsButtonRefresh from './ControlsButtonRefresh';

export default function Controls() {
    const [showDrives, setShowDrives] = useState(false);

    const handleListDrives = async () => {
        setShowDrives(!showDrives); // Show the drives list
    };

    const handleDirectoryClick = async (path: string) => {
        await changeDirectory(path);
    };

    useEffect(() => {
        const unlisten = listen<string>('trigger-reload', async (event) => {
            setShowDrives(false);
        });

        const unlisten2 = listen<string>('directory-changed', async (event) => {
            setShowDrives(false);
        });

        return () => {
            unlisten.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
            unlisten2.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
        };
    }, []);

    return (
        <>
            {showDrives && <ControlsDriveList handleDirectoryClick={handleDirectoryClick} handleListDrives={handleListDrives} />}
            <div className="flex text-2xl font-bold pl-2 py-3 text-dir bg-white bg-opacity-30">
                <ControlsButtonBack />
                <ControlsButtonHome />
                <ControlsButtonDrives handleListDrives={handleListDrives} showDrives={showDrives} />
                <ControlsButtonSelectPath />
                <ControlsButtonExplorer />
                <ControlsButtonTerminal />
                <ControlsButtonRefresh />
            </div>
        </>
    );
}
