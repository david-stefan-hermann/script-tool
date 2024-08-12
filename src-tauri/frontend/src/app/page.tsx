import Image from "next/image";
import FileExplorer from "../components/fileexplorer/FileExplorer";

export default function Home() {
  return (
    <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 bg-sky-950 overflow-hidden grid grid-cols-3">
      <div className="col-start-3 max-h-screen overflow-hidden">
        <FileExplorer />
      </div>
    </main>
  );
}
