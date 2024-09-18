import FallingPetalsBackground from "@/components/layout/FallingPetalsBackground";
import LayeredBackground from "@/components/layout/LayeredBackground";
import FilePrinter from "@/features/file-printer/FilePrinter";

export default function Page() {
    return (
        <main className="min-h-screen max-h-screen min-h-screen h-screen p-4 flex flex-row gap-4">
            <LayeredBackground />
            <FallingPetalsBackground
                animationSpeed={0.2}
                petalSize={0.8}
                petalMultiplier={1.5}
            />
            <div className="max-h-screen w-full overflow-hidden">
                <FilePrinter />
            </div>
        </main>
    );
}
