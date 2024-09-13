"use client";

import React, { useState } from 'react';
import FileRenamer from './FileRenamer';
import EpisodeNumberAdjuster from './EpisodeNumberAdjuster';
import { BsInfoCircle } from 'react-icons/bs';
import EpisodeRenamer from './EpisodeRenamer';
import GlassCard from '../stylingComponents/GlassCard';
import ImageButtonSwitch from '../stylingComponents/ImageButtonSwitch';

export default function FileOperations() {
    const [selectedOperation, setSelectedOperation] = useState<string>('fileRenamer');
    const [options, setOptions] = useState<FileOperationsOptions[]>();

    type ToolOption = 'SR' | 'ADJ' | 'ER';  // Define the three possible options
    const [toolOption, setToolOption] = useState<ToolOption>('SR');  // Initialize with one of the options

    useState(() => {
        setOptions([
            {
                id: 'SR',
                title: 'Suchen und Ersetzen',
                description: 'Benenne Video Dateien in einem Verzeichnis um.',
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
                description: 'Benenne Episoden in einem Verzeichnis um.',
                option: <EpisodeRenamer />
            }
        ]);
    });

    return (
        <>
            <GlassCard title="Werkzeug" image='/styling/backsplash/red.jpg' bgClass='bg-bottom'>
                <div className="p-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                        {/* Search and Replace */}
                        <ImageButtonSwitch title="Suchen und Ersetzen" image='/logos/jikan_logo.png' selected={toolOption == "SR"} onClick={() => setToolOption("SR")} />
                        {/* Episode Counter Adjuster */}
                        <ImageButtonSwitch title="Episodenzahl anpassen" image='/logos/thetvdb_logo.jpg' selected={toolOption == "ADJ"} onClick={() => setToolOption("ADJ")} />
                        {/* Episode Renamer */}
                        <ImageButtonSwitch title="Episoden benennen" image='/logos/tvmaze_logo.png' selected={toolOption == "ER"} onClick={() => setToolOption("ER")} />
                    </div>
                    <span className="mr-2"><BsInfoCircle className='h-5 w-5 align-sub inline mr-2' />Beschreibung</span>
                    <span>{options?.find((option) => option.id === toolOption)?.description}</span>
                </div>
            </GlassCard>
            {selectedOperation && options?.find((option) => option.id === toolOption)?.option}
        </>
    );
}

interface FileOperationsOptions {
    id: string;
    title: string;
    description: string;
    option: React.ReactNode;
}
