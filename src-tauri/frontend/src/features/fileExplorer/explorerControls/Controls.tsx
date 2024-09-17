"use client";

import React, { useEffect, useState } from 'react';
import {
    changeDirectory,
} from '../../../services/tauriService';
import ControlsListDrives from './ControlsListDrives';
import ControlsButtonDrives from './ControlsButtonDrives';
import ControlsButtonHome from './ControlsButtonHome';
import ControlsButtonBack from './ControlsButtonBack';
import { listen } from '@tauri-apps/api/event';
import ControlsButtonSelectPath from './ControlsButtonSelectPath';
import ControlsButtonExplorer from './ControlsButtonExplorer';
import ControlsButtonTerminal from './ControlsButtonTerminal';
import ControlsButtonRefresh from './ControlsButtonRefresh';
import ControlsButtonPrint from './ControlsButtonPrint';
import ControlsListPrint from './ControlsListPrint';


export default function Controls() {
    const [showDrives, setShowDrives] = useState(false);
    const [showPrint, setShowPrint] = useState(false);

    async function handleDirectoryClick(path: string) {
        await changeDirectory(path);
    };

    useEffect(() => {
        const unlisten = listen<string>('trigger-reload', async (event) => {
            resetDropUps();
        });

        const unlisten2 = listen<string>('directory-changed', async (event) => {
            resetDropUps();
        });

        return () => {
            unlisten.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
            unlisten2.then((fn) => fn()); // Unsubscribe from the event when the component unmounts
        };
    }, []);

    function handleListDrives() {
        resetDropUps();
        setShowDrives(!showDrives); // Show the drives list
    };

    function handleListPrint(): void {
        resetDropUps();
        setShowPrint(!showPrint);
    };

    function resetDropUps() {
        setShowDrives(false);
        setShowPrint(false);
    }

    return (
        <>
            {showPrint && <ControlsListPrint toggleListPrint={handleListPrint} />}
            {showDrives && <ControlsListDrives handleDirectoryClick={handleDirectoryClick} toggleListDrives={handleListDrives} />}
            <div className="flex text-2xl font-bold pl-2 py-3 text-dir bg-white bg-opacity-30">
                <ControlsButtonBack />
                <ControlsButtonHome />
                <ControlsButtonDrives toggleListDrives={handleListDrives} showDrives={showDrives} />
                <ControlsButtonSelectPath />
                <ControlsButtonExplorer />
                <ControlsButtonTerminal />
                <ControlsButtonRefresh />
                <ControlsButtonPrint toggleListPrint={handleListPrint} showPrint={showPrint} />
            </div>
        </>
    );
}
