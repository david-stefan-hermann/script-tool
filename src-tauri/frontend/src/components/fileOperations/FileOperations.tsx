"use client";

import React, { useEffect, useState } from 'react';
import FileRenamer from './FileRenamer';
import EpisodeNumberAdjuster from './EpisodeNumberAdjuster';
import EpisodeRenamer from './EpisodeRenamer';
import GlassCard from '../layout/GlassCard';
import ImageButtonSwitch from '../ui/ImageButtonSwitch';
import { triggerRefresh } from '@/services/tauriService';
import InfoMessage from '../common/InfoMessage';
import FolderOrganizer from './FolderOrganizer';

interface FileOperationsOptions {
    id: string;
    title: string;
    description: string;
    image: string;
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
                image: '/styling/buttons/search.jpeg',
                option: <FileRenamer />
            },
            {
                id: 'ADJ',
                title: 'Episodennummer anpassen',
                description: 'Passe die Episodennummern in den Dateinamen an.',
                image: '/styling/buttons/adjuster.jpg',
                option: <EpisodeNumberAdjuster />
            },
            {
                id: 'ER',
                title: 'Episoden umbenennen',
                description: 'Benenne Episoden in einem Verzeichnis. Drücke "Titel laden" um automatisch Titel zu laden.',
                image: '/styling/buttons/rename2.jpg',
                option: <EpisodeRenamer />
            },
            {
                id: 'FO',
                title: 'In Ordner Verschieben',
                description: 'Verschiebe Dateien in Ordner. Oder ziehe Dateien aus Ordnern.',
                image: '/styling/buttons/folder.jpg',
                option: <FolderOrganizer />
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
                        {options?.map((option) => (
                            <ImageButtonSwitch
                                key={option.id}
                                title={option.title}
                                image={option.image}
                                selected={toolOption == option.id}
                                onClick={() => setToolOption(option.id as ToolOption)}
                            />
                        ))}
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

