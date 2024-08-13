import { invoke } from '@tauri-apps/api/tauri';

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
    return invoke('rename_files_in_directory', { target_str: targetStr, replacement_str: replacementStr });
};
