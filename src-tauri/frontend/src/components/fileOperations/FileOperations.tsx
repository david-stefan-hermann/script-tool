"use client";

import React, { useEffect, useState } from 'react';
import FileRenamer from './FileRenamer';
import EpisodeNumberAdjuster from './EpisodeNumberAdjuster';
import { BsInfoCircle } from 'react-icons/bs';
import EpisodeRenamer from './EpisodeRenamer';
import GlassCard from '../layout/GlassCard';
import ImageButtonSwitch from '../ui/ImageButtonSwitch';
import { triggerRefresh } from '@/services/tauriService';
import InfoMessage from '../common/InfoMessage';

interface FileOperationsOptions {
    id: string;
    title: string;
    description: string;
    option: React.ReactNode;
}

export default function FileOperations() {
    type ToolOption = 'SR' | 'ADJ' | 'ER';  // Define the three possible options
    const [options, setOptions] = useState<FileOperationsOptions[]>();
    const [toolOption, setToolOption] = useState<ToolOption>('SR');  // Initialize with one of the options

    useState(() => {
        setOptions([
            {
                id: 'SR',
                title: 'Suchen und Ersetzen',
                description: 'Benenne alle Video Dateien in einem Verzeichnis um.',
                option: <FileRenamer />
            },
            {
                id: 'ADJ',
                title: 'Episodennummer anpassen',
                description: 'Passe die Episodennummern in den Dateinamen an.',
                option: <EpisodeNumberAdjuster />
            },
            {
                id: 'ER',
                title: 'Episoden umbenennen',
                description: 'Benenne Episoden in einem Verzeichnis. Drücke "Titel laden" um automatisch Titel zu laden.',
                option: <EpisodeRenamer />
            }
        ]);
    });

    useEffect(() => {
        triggerRefresh();
    }, [toolOption]);

    return (
        <>
            <GlassCard title="Werkzeug" image='/styling/backsplash/red.jpg' bgClass='bg-bottom'>
                <div className="p-2 flex flex-col gap-2">
                    <div className="flex gap-2 justify-center">
                        {/* Search and Replace */}
                        <ImageButtonSwitch title="Suchen und Ersetzen" image='/styling/buttons/search.jpeg' selected={toolOption == "SR"} onClick={() => setToolOption("SR")} />
                        {/* Episode Counter Adjuster */}
                        <ImageButtonSwitch title="Episodenzahl anpassen" image='/styling/buttons/adjuster.jpg' selected={toolOption == "ADJ"} onClick={() => setToolOption("ADJ")} />
                        {/* Episode Renamer */}
                        <ImageButtonSwitch title="Episoden benennen" image='/styling/buttons/rename2.jpg' selected={toolOption == "ER"} onClick={() => setToolOption("ER")} />
                    </div>
                    <GlassCard>
                        <InfoMessage message={options?.find((option) => option.id === toolOption)?.description} />
                    </GlassCard>
                </div>
            </GlassCard>
            {toolOption && options?.find((option) => option.id === toolOption)?.option}
        </>
    );
}

