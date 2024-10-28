import { invoke } from '@tauri-apps/api/tauri';

// File Explorer Commands

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

export const openInFileExplorer = async () => {
    return await invoke<void>('open_in_file_explorer');
};

export const openInTerminal = async () => {
    return await invoke<void>('open_in_terminal');
};

export const selectDirectory = async () => {
    return await invoke<void>('select_and_set_current_path');
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
    is_offline: boolean;
};

// Get Current Episode Names

export const getCurrentEpisodeNames = async (): Promise<string[]> => {
    return invoke('get_current_episode_names');
};

// Adjust Episode Numbers

export const adjustEpisodeNumbers = async (adjustmentValue: number): Promise<void> => {
    return invoke('adjust_episode_numbers', { adjustmentValue });
};

export const adjustEpisodeNumbersPreview = async (adjustmentValue: number): Promise<void> => {
    return invoke('adjust_episode_numbers_preview', { adjustmentValue });
};

// Rename Files ( search and replace )

export const searchAndReplace = async (targetStr: string, replacementStr: string): Promise<void> => {
    return invoke('search_and_replace', { targetStr: targetStr, replacementStr: replacementStr });
};

export const searchAndReplacePreview = async (targetStr: string, replacementStr: string): Promise<String[]> => {
    return invoke('search_and_replace_preview', { targetStr: targetStr, replacementStr: replacementStr });
};

// Append Titles to Episodes

export const addTitlesToEpisodes = async (episodeTitles: string[]): Promise<void> => {
    return invoke('add_titles_to_episodes', { episodeTitles });
};

export const addTitlesToEpisodesPreview = async (episodeTitles: string[]): Promise<String[]> => {
    return invoke('add_titles_to_episodes_preview', { episodeTitles });
};


export const openEpisodeTitleWindow = async (): Promise<void> => {
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

// QR Code Generator

export interface QrCodeResponse {
    qr_value: string;
    base64_image: string;
}

export const generateQrCode = async (qrValue: string): Promise<QrCodeResponse> => {
    return invoke('generate_qr_code', { qrValue });
};

export const saveQrCodeSvg = async (filePath: string, qrString: string): Promise<void> => {
    return invoke('save_qr_code_as_svg', { filePath, qrString });
}

export const saveQrCodePng = async (filePath: string, qrString: string): Promise<void> => {
    return invoke('save_qr_code_as_png', { filePath, qrString });
}


// File Organizer

export const putFilesInFolders = async (): Promise<void> => {
    return invoke('organize_videos_into_directories');
};

export const pullFilesFromFolders = async (): Promise<String[]> => {
    return invoke('flatten_single_file_directories');
};

// Printer: Load Files

export const printMediaFilesInDirectories = async (): Promise<void> => {
    return invoke('print_media_files_in_directories');
};

export const printFileSizes = async (): Promise<void> => {
    return invoke('print_file_sizes');
};

export const caancelFilePrinter = async (): Promise<void> => {
    return invoke('cancel_file_printer');
};

export const saveFileToFolder = async (folderPath: string, fileInfoList: FileInfo[]): Promise<void> => {
    return invoke('save_file_to_folder', { folderPath, fileInfoList });
};