import { invoke } from '@tauri-apps/api/tauri';
import exp from 'constants';

export const listFilesInCurrentDirectory = async () => {
    return await invoke<FileInfo[]>('list_files_in_current_directory');
};

export const changeDirectory = async (path: string) => {
    return await invoke<void>('change_directory', { path });
};

export const goToParentDirectory = async () => {
    return await invoke<void>('go_to_parent_directory');
};

export const goToHomeDirectory = async () => {
    return await invoke<void>('list_files_in_home_directory');
};

export const getCurrentPath = async () => {
    return await invoke<string>('get_current_path');
};

export const getDirectoryHierarchy = async () => {
    return await invoke<DirectoryHierarchy[]>('get_directory_hierarchy');
};

export const listDrives = async () => {
    return await invoke<DriveInfo[]>('list_drives');
};

// Define the types returned by the Rust commands
export type FileInfo = {
    path: string;
    is_dir: boolean;
    is_video: boolean;
    name: string;
};

export type DirectoryHierarchy = {
    full_path: string;
    dir_name: string;
};

export type DriveInfo = {
    letter: string;
    name: string;
};

export const renameFilesInDirectory = async (targetStr: string, replacementStr: string): Promise<void> => {
    console.log("Renaming filesss:", targetStr, replacementStr);
    return invoke('rename_files_in_directory', { targetStr: targetStr, replacementStr: replacementStr });
};

export const adjustEpisodeNumbersInDirectory = async (adjustmentValue: number): Promise<void> => {
    console.log("Adjusting episode numbers by:", adjustmentValue);
    return invoke('adjust_episode_numbers_in_directory', { adjustmentValue });
};

export const getCurrentEpisodeNames = async (): Promise<string[]> => {
    console.log("Getting current episode names");
    return invoke('get_current_episode_names');
};

export const renameEpisodesWithTitles = async (episodeTitles: string[]): Promise<void> => {
    console.log("Renaming episodes with titles:", episodeTitles);
    return invoke('rename_episodes_with_titles', { episodeTitles });
};

export const openEpisodeTitleWindow = async (): Promise<void> => {
    console.log("Opening episode title window");
    try {
        await invoke('open_episode_title_window'); // Call the Tauri command
    } catch (error) {
        console.error('Failed to open new window:', error);
    }
};

export const fetchAnimeEpisodeTitlesGroupedBySeason = async (animeId: number | null, animeName: string | null, year: number | null): Promise<SeasonedEpisodes[]> => {
    console.log("Fetching anime episode titles grouped by season:", animeId, animeName, year);
    return invoke('fetch_anime_episode_titles_grouped_by_season', { animeId, animeName, year });
};

export const fetchTVDBAnimeEpisodeTitles = async (tvdbApiKey: string, animeId: number | null, animeName: string | null, year: number | null): Promise<SeasonedEpisodes[]> => {
    console.log("Fetching TVDB anime episode titles:", tvdbApiKey, animeId);
    return invoke('fetch_tvdb_episode_titles_grouped_by_season', { tvdbApiKey, animeId, animeName, year });
};

export const fetchTVMAZEAnimeEpisodeTitlesBySeason = async (animeId: number | null, animeName: string | null, year: number | null, season: number): Promise<string[]> => {
    console.log("Fetching TVMaze anime episode titles by season:", animeId, animeName, year, season);
    return invoke('fetch_tvmaze_episode_titles_grouped_by_season', { animeId, animeName, year, season });
}

export interface SeasonedEpisodes {
    season: number;
    start_episode: number;
    end_episode: number;
    titles: string[];
}
