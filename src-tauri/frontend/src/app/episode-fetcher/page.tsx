"use client";

import EpisodeTitleFetcher from "@/components/episodeTitleFetcher/EpisodeTitleFetcher";
import FallingPetalsBackground from "@/components/layout/FallingPetalsBackground";
import LayeredBackground from "@/components/layout/LayeredBackground";
import { useState } from "react";
import { SeasonedEpisodes, SeasonedEpisodesDetails } from '@/services/tauriService';
import { EpisodeTitleFetcherList } from "@/components/episodeTitleFetcher/EpisodeTitleFetcherList";

export default function Page() {
    const [seasons, setSeasons] = useState<SeasonedEpisodes[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState<SeasonedEpisodesDetails | null>(null);

    return (
        <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 flex flex-row gap-4">
            <LayeredBackground />
            <FallingPetalsBackground
                animationSpeed={0.2}
                petalSize={0.8}
                petalMultiplier={1.5}
            />
            <div className="max-h-screen overflow-hidden basis-1/2">
                <EpisodeTitleFetcher
                    seasons={seasons}
                    setSeasons={setSeasons}
                    selectedSeason={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                    error={error}
                    setError={setError}
                    setShowDetails={setShowDetails}
                />
            </div>

            <div className="max-h-screen overflow-hidden basis-1/2">
                <EpisodeTitleFetcherList
                    seasons={seasons}
                    selectedSeason={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                    setError={setError}
                    showDetails={showDetails}
                />
            </div>
        </main>
    );
}
