"use client";

import { useState } from "react";
import { SeasonedEpisodes, SeasonedEpisodesDetails } from "@/services/tauriService";
import { AnimatedButton } from "../stylingComponents/AnimatedButton";
import { emit } from '@tauri-apps/api/event';
import GlassCard from "../stylingComponents/GlassCard";

interface EpisodeTitleFetcherListProps {
    seasons: SeasonedEpisodes[];
    selectedSeason: number;
    setSelectedSeason: React.Dispatch<React.SetStateAction<number>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    showDetails: SeasonedEpisodesDetails | null;
}

export function EpisodeTitleFetcherList({ seasons, selectedSeason, setSelectedSeason, setError, showDetails }: EpisodeTitleFetcherListProps) {
    const [copySuccess, setCopySuccess] = useState('');  // For displaying the copy success message
    const [sendSuccess, setsendSuccess] = useState('');
    const handleCopy = () => {
        const selectedTitles = seasons.find((season) => season.season === selectedSeason)?.titles.join('\n');
        if (selectedTitles) {
            navigator.clipboard.writeText(selectedTitles).then(() => {
                setCopySuccess('Werte kopiert!');
                setTimeout(() => {
                    setCopySuccess('');
                }, 2000);
            });
        }
    };

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSeason(parseInt(e.target.value, 10));
    };

    const handleSendFetchedEpisodeTitles = async () => {
        try {
            const selectedTitles = seasons.find((season) => season.season === selectedSeason)?.titles;
            await emit('send_episodes', { episodeTitles: selectedTitles });

            setsendSuccess('Titel gesendet!');
            setTimeout(() => {
                setsendSuccess('');
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(String(err));
        }
    }

    return (
        <GlassCard className='h-full' title={showDetails ? String(showDetails.name + " (" + showDetails.premiered_year + ")") : 'Episodenliste'} image='/styling/backsplash/orange.jpg'>
            <div className='p-4 flex flex-col w-full h-full overflow-x-hidden gap-4'>

                {showDetails?.name && (
                    <div className="flex flex-row gap-4">
                        <div className="text-lg font-bold">Serien ID: {showDetails.id}</div>
                    </div>
                )}

                {/* Season Dropdown and Text Area */}
                {seasons.length > 0 && (
                    <>
                        <div className="">
                            <select
                                value={selectedSeason}
                                onChange={handleSeasonChange}
                                className="border rounded px-2 py-1 w-full"
                            >
                                {seasons.map((season) => (
                                    <option key={season.season} value={season.season}>
                                        {`Staffel 0${season.season}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <textarea
                            className="border rounded px-2 py-1 w-full flex flex-grow overflowy-scroll"
                            value={seasons.find((season) => season.season === selectedSeason)?.titles.join('\n') || ''}
                            readOnly
                        />
                        <div className="flex flex-row gap-4">
                            {/* Send Episodes Button */}
                            <AnimatedButton text={sendSuccess ? sendSuccess : 'Übernehmen'} onClick={handleSendFetchedEpisodeTitles} image='/styling/buttons/button-blue.jpg' />
                            {/* Copy Episodes Button */}
                            <AnimatedButton text={copySuccess ? copySuccess : 'Kopieren'} onClick={handleCopy} image='/styling/buttons/button-purple.jpg' />
                        </div>
                    </>
                )}
            </div>
        </GlassCard>
    )
}