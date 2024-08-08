"use client"

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import File from './File';
import { HomeIcon, ArrowTurnUpLeftIcon } from '@heroicons/react/24/outline';

type FileInfo = {
  path: string;
  is_dir: boolean;
  is_video: boolean;
  name: string;
};

type FileListResponse = FileInfo[];

export default function FileList() {
  const [files, setFiles] = useState<FileListResponse>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles(path: string | null) {
      try {
        const result = await invoke<FileListResponse>(path ? 'list_files_in_directory' : 'list_home_files', { path });
        setFiles(result);
        setCurrentPath(path);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    fetchFiles(currentPath);
  }, [currentPath]);

  const handleDirectoryClick = (path: string) => {
    setError(null);
    setCurrentPath(path);
  };

  const handleGoBack = async (path: string | null) => {
    if (!path) return;
    const result = await invoke<string>('get_parent_directory', { path });
    result && setCurrentPath(result);
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Deteiexplorer</h1>
      {error ? 
      <div className="text-red-500 flex flex-grow justify-center">Error: {error}</div> :
        <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow">
          {files.map((file, index) => (
            <File key={index} index={index} file={file} onClickFunction={handleDirectoryClick} />
          ))}
        </ul>
      }
      <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2 color-blue-500">
        <ArrowTurnUpLeftIcon
          className="h-5 w-5 text-red-500 inline mr-2 cursor-pointer"
          onClick={() => handleGoBack(currentPath)} />
        <HomeIcon
          className="h-5 w-5 text-red-500 inline mr-2 cursor-pointer"
          onClick={() => { handleDirectoryClick("") }} />
      </h1>
    </div>
  );
}