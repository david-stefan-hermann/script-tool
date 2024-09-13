"use client";

import { useEffect, useState } from 'react';
import { SeasonedEpisodes, fetchAnimeEpisodeTitlesGroupedBySeason, fetchTVDBAnimeEpisodeTitles, fetchTVMAZEAnimeEpisodeTitlesBySeason } from '@/services/tauriService';
import { AnimatedButton } from '../stylingComponents/AnimatedButton';
import GlassCard from '../stylingComponents/GlassCard';
import ImageButtonSwitch from '../stylingComponents/ImageButtonSwitch';

interface EpisodeTitleFetcherProps {
  seasons: SeasonedEpisodes[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonedEpisodes[]>>; // Function to update the state
  selectedSeason: number;
  setSelectedSeason: React.Dispatch<React.SetStateAction<number>>; // Function to update the state
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>; // Function to update the state
}

export default function EpisodeTitleFetcher({ seasons, setSeasons, selectedSeason, setSelectedSeason, error, setError }: EpisodeTitleFetcherProps) {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [animeName, setAnimeName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  //const [seasons, setSeasons] = useState<SeasonedEpisodes[]>([]);
  //const [selectedSeason, setSelectedSeason] = useState<number>(1);
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

      if (apiOption == "TVDB") {
        if (!tvdbApiKey) {
          setError('TVDB API key is required.');
          return;
        }
        // Fetch from TheTVDB
        fetchedSeasons = await fetchTVDBAnimeEpisodeTitles(tvdbApiKey, animeId, animeName, year);
      } else if (apiOption == "JIKA") {
        // Fetch from Jikan
        fetchedSeasons = await fetchAnimeEpisodeTitlesGroupedBySeason(animeId, animeName, year);
      } else {
        // Fetch from TVmaze
        fetchedSeasons = await fetchTVMAZEAnimeEpisodeTitlesBySeason(animeId, animeName, year);
      }

      setSeasons(fetchedSeasons);
      if (fetchedSeasons.length > 0) {
        setSelectedSeason(fetchedSeasons[0].season);
      }
    } catch (err) {
      console.error(err);
      setError(String(err));
    }
  };


  useEffect(() => {
    setError(null);
  }, [animeId, animeName, year, apiOption, tvdbApiKey]);

  return (
    <GlassCard className='h-full' title='Episoden Laden' image='/styling/backsplash/green.jpg'>
      <div className='p-4 flex flex-col w-full h-full overflow-x-hidden gap-4'>
        <div className="flex flex-row gap-4">
          {/* API Selection Images */}
          <div>
            <label className="block mb-2">API Quelle <a className="text-purple-700 hover:text-purple-600 active:text-pink-600" href={apiSourceUrl[apiOption].href} target="_blank" rel="noopener noreferrer">{apiSourceUrl[apiOption].href}</a>
            </label>
            <div className="flex gap-2">
              {/* Jikan Button */}
              <ImageButtonSwitch title="Jikan" image='/logos/jikan_logo.png' scale={0.8} selected={apiOption == "JIKA"} onClick={() => setApiOption("JIKA")} />
              {/* TVDB Button */}
              <ImageButtonSwitch title="TheTVDB" image='/logos/thetvdb_logo.jpg' scale={0.8} selected={apiOption == "TVDB"} onClick={() => setApiOption("TVDB")} />
              {/* TVMaze Button */}
              <ImageButtonSwitch title="TVMaze" image='/logos/tvmaze_logo.png' scale={0.8} selected={apiOption == "TVMZ"} onClick={() => setApiOption("TVMZ")} />
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
        {error && <div className="text-red-500">{error}</div>}

        {/* Fetch Episode Titles Button */}
        <div className='flex flex-row w-full'>
          <AnimatedButton text="Titel laden" onClick={fetchEpisodeTitles} image='/styling/buttons/button-purple.jpg' />
        </div>
      </div>
    </GlassCard>
  );
}
