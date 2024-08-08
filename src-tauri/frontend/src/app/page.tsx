import Image from "next/image";
import FileBrowser from "@/components/FileBrowser";
import FileList from '../components/filelist/FileList';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-column p-4 bg-sky-950">
      <div className="flex flex-row bg-blue-500 py-2">
        <div className="basis-1/2 bg-red-500 py-2">
          <FileList />
        </div>
        <div className="basis-1/2 bg-green-500 py-2">
        </div>
      </div>
    </main>
  );
}
