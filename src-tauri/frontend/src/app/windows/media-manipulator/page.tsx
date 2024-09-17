import FileExplorer from "@/features/fileExplorer/FileExplorer";
import FilePreview from "@/features/fileExplorer/FilePreview";
import FileOperations from "@/features/fileOperations/FileOperations";

export default function Page() {
  return (
    <main className="h-full w-full p-4 flex flex-row gap-4 overflow-hidden">
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
