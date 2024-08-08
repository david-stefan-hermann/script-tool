"use client"

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import File from './File';

type FileInfo = {
  path: string;
  is_dir: boolean;
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
    setCurrentPath(path);
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-1 bg-sky-900 w-full h-full bg-white">
      <h1 className="text-2xl font-bold mb-4">Directory Files</h1>
      <ul className="divide-y divide-gray-200">
        {files.map((file, index) => (
          <File key={index} index={index} file={file} onClickFunction={handleDirectoryClick} />
        ))}
      </ul>
    </div >
  );
}