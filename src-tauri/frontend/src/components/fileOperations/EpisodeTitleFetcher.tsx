"use client";

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function EpisodeTitleFetcher() {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [animeName, setAnimeName] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [episodeTitles, setEpisodeTitles] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodeTitles = async () => {
    setError(null);
    setEpisodeTitles('');

    try {
      const titles: string[] = await invoke('fetch_anime_episode_titles', {
        animeId,
        animeName,
        year,
      });

      setEpisodeTitles(titles.join('\n'));
    } catch (err) {
      console.error(err);
      setError(String(err));
    }
  };

  const handleCopy = () => {
    if (episodeTitles) {
      navigator.clipboard.writeText(episodeTitles).then(() => {
        alert('Copied to clipboard!');
      });
    }
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

        <textarea
          className="border rounded px-2 py-1 w-full h-48"
          value={episodeTitles}
          readOnly
        />

        <button
          onClick={handleCopy}
          className="bg-green-500 text-white px-4 py-2 rounded w-full mt-4"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
