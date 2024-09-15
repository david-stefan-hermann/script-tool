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

export const adjustEpisodeNumbersInDirectory = async (adjustmentValue: number): Promise<void> => {
    console.log("Adjusting episode numbers by:", adjustmentValue);
    return invoke('adjust_episode_numbers_in_directory', { adjustmentValue });
};

export const getCurrentEpisodeNames = async (): Promise<string[]> => {
    console.log("Getting current episode names");
    return invoke('get_current_episode_names');
};

// Rename Files in Directory ( search and replace )

export const searchAndReplaceInDirectory = async (targetStr: string, replacementStr: string): Promise<void> => {
    console.log("search_and_replace:", targetStr, replacementStr);
    return invoke('search_and_replace', { targetStr: targetStr, replacementStr: replacementStr });
};

export const searchAndReplaceInDirectoryPreview = async (targetStr: string, replacementStr: string): Promise<String[]> => {
    console.log("search_and_replace_preview:", targetStr, replacementStr);
    return invoke('search_and_replace_preview', { targetStr: targetStr, replacementStr: replacementStr });
};

// Append Titles to Episodes

export const addTitlesToEpisodes = async (episodeTitles: string[]): Promise<void> => {
    console.log("Add Titles to Episodes:", episodeTitles);
    return invoke('add_titles_to_episodes', { episodeTitles });
};

export const addTitlesToEpisodesPreview = async (episodeTitles: string[]): Promise<String[]> => {
    console.log("Add Titles to Episodes Preview:", episodeTitles);
    return invoke('add_titles_to_episodes_preview', { episodeTitles });
};


export const openEpisodeTitleWindow = async (): Promise<void> => {
    console.log("Opening episode title window");
    try {
        await invoke('open_episode_title_window'); // Call the Tauri command
    } catch (error) {
        console.error('Failed to open new window:', error);
    }
};

export interface SeasonedEpisodes {
    season: number;
    start_episode: number;
    end_episode: number;
    titles: string[];
}

export const fetchTVDBShowDetails = async (tvdbApiKey: string, animeId: number | null, animeName: string | null, year: number | null): Promise<SeasonedEpisodes[]> => {
    return invoke('fetch_tvdb_episode_titles_grouped_by_season', { tvdbApiKey, animeId, animeName, year });
};

export interface SeasonedEpisodesDetails {
    id: number,
    name: String,
    premiered_year?: number,
    episodes_by_season: SeasonedEpisodes[]
};

export const fetchJikanShowDetails = async (animeId: number | null, animeName: string | null, year: number | null): Promise<SeasonedEpisodesDetails> => {
    return invoke('fetch_jikan_show_details', { animeId, animeName, year });
};

export const fetchTVMAZEShowDetails = async (animeId: number | null, animeName: string | null, year: number | null): Promise<SeasonedEpisodesDetails> => {
    return invoke('fetch_tvmaze_show_details', { animeId, animeName, year });
};

export const focusMainWindow = async (): Promise<void> => {
    console.log("Focusing main window");
    return invoke('focus_main_window');
};

export const triggerRefresh = async (): Promise<void> => {
    console.log("Triggering refresh");
    return invoke('trigger_refresh');
};