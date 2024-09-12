"use client";

import React, { useState } from 'react';
import FileRenamer from './FileRenamer';
import EpisodeNumberAdjuster from './EpisodeNumberAdjuster';
import { BsInfo, BsInfoCircle, BsTools, BsWrench } from 'react-icons/bs';
import EpisodeRenamer from './EpisodeRenamer';
import GlassCard from '../stylingComponents/GlassCard';

export default function FileOperations() {
    const [selectedOperation, setSelectedOperation] = useState<string>('fileRenamer');
    const [options, setOptions] = useState<FileOperationsOptions[]>();

    useState(() => {
        setOptions([
            {
                id: 'fileRenamer',
                title: 'Suchen und Ersetzen',
                description: 'Benenne Video Dateien in einem Verzeichnis um.',
                option: <FileRenamer />
            },
            {
                id: 'episodeNumberAdjuster',
                title: 'Episodennummer anpassen',
                description: 'Passe die Episodennummern in den Dateinamen an.',
                option: <EpisodeNumberAdjuster />
            },
            {
                id: 'episodeRenamer',
                title: 'Episoden umbenennen',
                description: 'Benenne Episoden in einem Verzeichnis um.',
                option: <EpisodeRenamer />
            }
        ]);
    });

    return (
        <div className='flex flex-col h-full'>
            <GlassCard>
                <h1 className="flex md:text-2xl text-xl bg-bottom"
                    style={{ backgroundImage: "url('/styling/buttons/red.jpg')" }}>Werkzeug</h1>
                <div className="p-2 flex flex-col gap-2">
                    <span className="mr-2"><BsTools className='h-5 w-5 align-sub inline text-blue-500 mr-2' />Werkzeug</span>
                    <select
                        id="operation-select"
                        value={selectedOperation}
                        onChange={(e) => setSelectedOperation(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        {options?.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.title}
                            </option>
                        ))}
                    </select>
                    <span className="mr-2"><BsInfoCircle className='h-5 w-5 align-sub inline text-blue-500 mr-2' />Beschreibung</span>
                    <span>{options?.find((option) => option.id === selectedOperation)?.description}</span>
                </div>
            </GlassCard>
            <GlassCard>
                {selectedOperation && options?.find((option) => option.id === selectedOperation)?.option}
            </GlassCard>
        </div>
    );
}

interface FileOperationsOptions {
    id: string;
    title: string;
    description: string;
    option: React.ReactNode;
}
