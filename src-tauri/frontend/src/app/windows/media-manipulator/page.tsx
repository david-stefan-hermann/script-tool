import FileExplorer from "@/components/fileExplorer/FileExplorer";
import FilePreview from "@/components/fileExplorer/FilePreview";
import FileOperations from "@/components/fileOperations/FileOperations";

export default function Page() {
  return (
    <main className="h-full w-full p-4 flex flex-row gap-4">
      <div className="max-h-screen overflow-hidden basis-1/3">
        <FileExplorer />
      </div>
      <div className="max-h-screen overflow-hidden basis-1/3 flex flex-col gap-4">
        <FileOperations />
      </div>
      <div className="max-h-screen overflow-hidden basis-1/3">
        <FilePreview />
      </div>
    </main>
  );
}