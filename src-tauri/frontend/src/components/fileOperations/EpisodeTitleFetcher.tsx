"use client";

import { useState } from 'react';
import { SeasonedEpisodes, fetchAnimeEpisodeTitlesGroupedBySeason, fetchTVDBAnimeEpisodeTitles, fetchTVMAZEAnimeEpisodeTitlesBySeason } from '@/services/tauriService';
import { Tooltip } from '@nextui-org/tooltip';
import { emit, listen } from '@tauri-apps/api/event'

export default function EpisodeTitleFetcher() {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [animeName, setAnimeName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<SeasonedEpisodes[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const apiSourceUrl = {
    "TVDB": { href: "https://www.thetvdb.com/", name: "TheTVDB" },
    "JIKA": { href: "https://jikan.moe/", name: "Jikan" },
    "TVMZ": { href: "https://www.tvmaze.com/", name: "TVMaze" },
  }
  const [copySuccess, setCopySuccess] = useState('');  // For displaying the copy success message
  const [sendSuccess, setsendSuccess] = useState('');

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
    <div className="flex flex-col gap-4 w-full h-full overflow-x-hidden bg-gray-100 text-md p-4 font-medium">
      <div className="flex flex-row gap-4">
        {/* API Selection Images */}
        <div>
          <label className="block mb-2">API Quelle <a className="text-blue-500 hover:text-blue-600" href={apiSourceUrl[apiOption].href} target="_blank" rel="noopener noreferrer">{apiSourceUrl[apiOption].href}</a>
          </label>
          <div className="flex gap-2">
            {/* Jikan Button */}
            <Tooltip content="Jikan" placement="top" className='bg-white px-2 rounded border border-gray-100'>
              <img
                src={"/logos/jikan_logo.png"}
                alt="Jikan API"
                className={`cursor-pointer h-16 w-16 ${apiOption == "JIKA" ? 'border-4 border-orange-500' : ''}`}
                onClick={() => setApiOption("JIKA")}
              />
            </Tooltip>
            {/* TVDB Button */}
            <Tooltip content="TheTVDB" placement="top" className='bg-white px-2 rounded border border-gray-100'>
              <img
                src={"/logos/thetvdb_logo.jpg"}
                alt="TheTVDB API"
                className={`cursor-pointer h-16 w-16 ${apiOption == "TVDB" ? 'border-4 border-orange-500' : ''}`}
                onClick={() => setApiOption("TVDB")}
              />
            </Tooltip>
            {/* TVMaze Button */}
            <Tooltip content="TVMaze" placement="top" className='bg-white px-2 rounded border border-gray-100'>
              <img
                src={"/logos/tvmaze_logo.png"}
                alt="TVmaze API"
                className={`cursor-pointer h-16 w-16 ${apiOption == "TVMZ" ? 'border-4 border-orange-500' : ''}`}
                onClick={() => setApiOption("TVMZ")}
              />
            </Tooltip>
          </div>
        </div>

        {/* TVDB API Key Input (shown if TheTVDB is selected) */}
        <div className='flex flex-col'>
          {apiOption == "TVDB" && (
            <div className='flex-grow'>
              <label className="block mb-2">TVDB API Key</label>
              <input
                type="text"
                value={tvdbApiKey || ''}
                onChange={(e) => setTvdbApiKey(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="Enter TVDB API Key"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4">
        {/* Anime ID Input */}
        <div className='flex-grow'>
          <label className="block mb-2">Anime ID</label>
          <input
            type="number"
            value={animeId || ''}
            onChange={(e) => setAnimeId(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter Anime ID (Optional)"
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
            placeholder="Enter Anime Name"
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
            placeholder="Enter Anime Name"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Fetch Episode Titles Button */}
      <button
        onClick={fetchEpisodeTitles}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Episodentitel laden
      </button>

      {/* Season Dropdown and Text Area */}
      {seasons.length > 0 && (
        <>
          <div className="">
            <label className="block mb-2">Staffel</label>
            <select
              value={selectedSeason}
              onChange={handleSeasonChange}
              className="border rounded px-2 py-1 w-full"
            >
              {seasons.map((season) => (
                <option key={season.season} value={season.season}>
                  {`Season ${season.season}`}
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
            <div className='flex-grow'>
              <button
                onClick={handleSendFetchedEpisodeTitles}
                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
              >
                {sendSuccess ? sendSuccess : 'Übernehmen?'}
              </button>
            </div>
            {/* Copy Episodes Button */}
            <div className='flex-grow'>
              <button
                onClick={handleCopy}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                {copySuccess ? copySuccess : 'Episodentitel kopieren'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
