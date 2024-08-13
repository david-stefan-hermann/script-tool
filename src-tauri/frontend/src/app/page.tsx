import FileExplorer from "@/components/fileExplorer/FileExplorer";
import FilePreview from "@/components/fileExplorer/FilePreview";
import FileOperations from "@/components/fileOperations/FileOperations";

export default function Home() {
  return (
    <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 bg-sky-950 overflow-hidden grid grid-cols-3 gap-4">
      <div className="col-start-1 max-h-screen overflow-hidden">
        <FileExplorer />
      </div>
      <div className="max-h-screen overflow-hidden">
        <FileOperations />
      </div>
      <div className="max-h-screen overflow-hidden">
        <FilePreview />
      </div>
    </main>
  );
}
