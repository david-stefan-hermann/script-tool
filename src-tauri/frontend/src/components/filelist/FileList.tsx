"use client"

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import File from './File';
import BreadCrumbs from './BreadCrumbs';
import Controls from './Controls';

interface FileInfo {
  path: string;
  is_dir: boolean;
  is_video: boolean;
  name: string;
};

interface FileListResponse extends Array<FileInfo> { }

export default function FileList() {
  const [files, setFiles] = useState<FileListResponse>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeDirectory = async () => {
    console.log('getting home directory');
    try {
      const result = await invoke<string>('get_home_directory');
      console.log('home', result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    return "";
  };

  useEffect(() => {
    async function fetchFiles(path: string | null) {
      if (!path) {
        path = await fetchHomeDirectory();
      }

      try {
        const result = await invoke<FileListResponse>('list_files_in_directory', { path });
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

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <h1 className="flex text-xl font-bold bg-gray-300 pl-2 py-2">Deteiexplorer</h1>
      <BreadCrumbs onClickFunction={handleDirectoryClick} path={currentPath} />
      {error ?
        <div className="text-red-500 flex flex-grow justify-center">Error: {error}</div> :
        <ul className="flex-col w-full max-h-full overflow-x-hidden flex-grow">
          {files.map((file, index) => (
            <File key={index} index={index} file={file} onClickFunction={handleDirectoryClick} />
          ))}
        </ul>
      }
      <Controls setPath={setCurrentPath} path={currentPath} />
    </div>
  );
}