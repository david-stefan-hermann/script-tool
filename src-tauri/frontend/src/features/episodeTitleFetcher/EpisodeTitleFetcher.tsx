"use client";

import { useEffect, useState } from 'react';
import { SeasonedEpisodes, SeasonedEpisodesDetails, fetchJikanShowDetails, fetchTVDBShowDetails, fetchTVMAZEShowDetails } from '@/services/tauriService';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/layout/GlassCard';
import ImageButtonSwitch from '@/components/ui/ImageButtonSwitch';
import ErrorMessage from '@/components/common/ErrorMessage';

interface EpisodeTitleFetcherProps {
  seasons: SeasonedEpisodes[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonedEpisodes[]>>; // Function to update the state
  selectedSeason: number;
  setSelectedSeason: React.Dispatch<React.SetStateAction<number>>; // Function to update the state
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>; // Function to update the state
  setShowDetails: React.Dispatch<React.SetStateAction<SeasonedEpisodesDetails | null>>;
}

export default function EpisodeTitleFetcher({ seasons, setSeasons, selectedSeason, setSelectedSeason, error, setError, setShowDetails }: EpisodeTitleFetcherProps) {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [animeName, setAnimeName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const apiSourceUrl = {
    "TVDB": { href: "https://www.thetvdb.com/", name: "TheTVDB" },
    "JIKA": { href: "https://jikan.moe/", name: "Jikan" },
    "TVMZ": { href: "https://www.tvmaze.com/", name: "TVMaze" },
  }

  // For handling the TVDB API key and the switch between Jikan and TheTVDB
  type ApiOption = 'TVDB' | 'JIKA' | 'TVMZ';  // Define the three possible options
  const [apiOption, setApiOption] = useState<ApiOption>('TVMZ');  // Initialize with one of the options

  const [tvdbApiKey, setTvdbApiKey] = useState<string | null>(null); // Store API key for TVDB

  const fetchEpisodeTitles = async () => {
    setError(null);
    setSeasons([]);
    setSelectedSeason(1);

    try {
      let fetchedSeasons: SeasonedEpisodes[] = [];
      let fetchedShowDetails: SeasonedEpisodesDetails | null = null;

      if (apiOption == "TVDB") {
        if (!tvdbApiKey) {
          setError('TVDB API key is required.');
          return;
        }
        // Fetch from TheTVDB
        fetchedSeasons = await fetchTVDBShowDetails(tvdbApiKey, animeId, animeName, year);
      } else if (apiOption == "JIKA") {
        // Fetch from Jikan
        const fetchedSeasonsDetails = await fetchJikanShowDetails(animeId, animeName, year);

        fetchedShowDetails = fetchedSeasonsDetails;

        fetchedSeasons = fetchedSeasonsDetails.episodes_by_season;
      } else {
        // Fetch from TVmaze
        const fetchedSeasonsDetails: SeasonedEpisodesDetails = await fetchTVMAZEShowDetails(animeId, animeName, year);

        fetchedShowDetails = fetchedSeasonsDetails;

        fetchedSeasons = fetchedSeasonsDetails.episodes_by_season
      }

      setShowDetails(fetchedShowDetails);

      setSeasons(fetchedSeasons);
      if (fetchedSeasons.length > 0) {
        setSelectedSeason(fetchedSeasons[0].season);
      }
    } catch (err) {
      setError(String(err));
      setShowDetails(null);
    }
  };


  useEffect(() => {
    setError(null);
  }, [animeId, animeName, year, apiOption, tvdbApiKey]);

  return (
    <GlassCard title='Episoden Laden' image='/styling/backsplash/green.jpg'>
      <div className='p-2 flex flex-col w-full h-full overflow-x-hidden gap-4'>
        <div className="flex flex-row gap-4">
          {/* API Selection Images */}
          <div>
            <label className="block mb-2">API Quelle <a className="text-purple-700 hover:text-purple-600 active:text-pink-600" href={apiSourceUrl[apiOption].href} target="_blank" rel="noopener noreferrer">{apiSourceUrl[apiOption].href}</a>
            </label>
            <div className="flex gap-2">
              {/* Jikan Button */}
              <ImageButtonSwitch size={4} title="Jikan" image='/logos/jikan_logo.png' selected={apiOption == "JIKA"} onClick={() => setApiOption("JIKA")} />
              {/* TVDB Button */}
              <ImageButtonSwitch size={4} title="TheTVDB" image='/logos/thetvdb_logo.jpg' selected={apiOption == "TVDB"} onClick={() => setApiOption("TVDB")} />
              {/* TVMaze Button */}
              <ImageButtonSwitch size={4} title="TVMaze" image='/logos/tvmaze_logo.png' selected={apiOption == "TVMZ"} onClick={() => setApiOption("TVMZ")} />
            </div>
          </div>
        </div>

        {/* TVDB API Key Input (shown if TheTVDB is selected) */}
        {apiOption == "TVDB" && (
          <div>
            <label className="block mb-2">TVDB API Key</label>
            <input
              type="text"
              value={tvdbApiKey || ''}
              onChange={(e) => setTvdbApiKey(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="required"
            />
          </div>
        )}

        <div className="flex flex-row gap-4">
          {/* Anime ID Input */}
          <div className='flex-grow'>
            <label className="block mb-2">Anime ID</label>
            <input
              type="number"
              value={animeId || ''}
              onChange={(e) => setAnimeId(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded px-2 py-1 w-full"
              placeholder="optional"
            />
          </div>

          {/* Anime Year Input */}
          <div className='flex-grow'>
            <label className="block mb-2">Anime Jahr</label>
            <input
              type="number"
              value={year || ''}
              onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded px-2 py-1 w-full"
              placeholder="optional"
            />
          </div>
        </div>

        <div className="flex flex-row gap-4">
          {/* Anime Name Input */}
          <div className='flex-grow'>
            <label className="block mb-2">Anime Titel</label>
            <input
              type="text"
              value={animeName || ''}
              onChange={(e) => setAnimeName(e.target.value || null)}
              className="border rounded px-2 py-1 w-full"
              placeholder="optional"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorMessage message={error}></ErrorMessage>}

        {/* Fetch Episode Titles Button */}
        <div className='flex flex-row w-full justify-center'>
          <AnimatedButton text="Titel laden" onClick={fetchEpisodeTitles} image='/styling/buttons/button-purple.jpg' />
        </div>
      </div>
    </GlassCard>
  );
}
