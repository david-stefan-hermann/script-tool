import Image from "next/image";
import FileBrowser from "@/components/FileBrowser";
import FileList from '../components/filelist/FileList';

export default function Home() {
  return (
    <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 bg-sky-950 overflow-hidden grid grid-cols-3">
      <div className="col-start-1 max-h-screen overflow-hidden">
        <FileList />
      </div>
    </main>
  );
}
