import FileExplorer from "@/components/fileExplorer/FileExplorer";
import FilePreview from "@/components/fileExplorer/FilePreview";
import FileOperations from "@/components/fileOperations/FileOperations";
import FallingPetalsBackground from "@/components/stylingComponents/FallingPetalsBackground";
import LayeredBackground from "@/components/stylingComponents/LayeredBackground";

export default function Home() {
  return (
    <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 flex flex-row gap-4">
      <LayeredBackground />
      <FallingPetalsBackground animationSpeed={0.2} petalSize={0.8} petalMultiplier={1.5} />
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
