"use client";

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface SeasonedEpisodes {
  season: number;
  start_episode: number;
  end_episode: number;
  titles: string[];
}

export default function EpisodeTitleFetcher() {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [animeName, setAnimeName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<SeasonedEpisodes[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodeTitles = async () => {
    setError(null);
    setSeasons([]);
    setSelectedSeason(1);

    try {
      const fetchedSeasons: SeasonedEpisodes[] = await invoke('fetch_anime_episode_titles_grouped_by_season', {
        animeId,
        animeName,
        year,
      });

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
        alert('Copied to clipboard!');
      });
    }
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(parseInt(e.target.value, 10));
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Episode Title Fetcher</h1>
      <div className="flex-col w-full max-h-full overflow-x-hidden flex-grow bg-gray-50 text-md p-4">

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Anime ID</label>
          <input
            type="number"
            value={animeId || ''}
            onChange={(e) => setAnimeId(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter Anime ID (Optional)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Anime Name</label>
          <input
            type="text"
            value={animeName || ''}
            onChange={(e) => setAnimeName(e.target.value || null)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter Anime Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Year (Optional)</label>
          <input
            type="number"
            value={year || ''}
            onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : null)}
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter Year (Optional)"
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <button
          onClick={fetchEpisodeTitles}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
        >
          Fetch Episode Titles
        </button>

        {seasons.length > 0 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Season</label>
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="border rounded px-2 py-1 w-full"
              >
                {seasons.map((season) => (
                  <option key={season.season} value={season.season}>
                    {`Season ${season.season} (EP ${season.start_episode}-${season.end_episode})`}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              className="border rounded px-2 py-1 w-full h-48"
              value={seasons.find((season) => season.season === selectedSeason)?.titles.join('\n') || ''}
              readOnly
            />

            <button
              onClick={handleCopy}
              className="bg-green-500 text-white px-4 py-2 rounded w-full mt-4"
            >
              Copy to Clipboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
