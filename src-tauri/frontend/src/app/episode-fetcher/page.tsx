import EpisodeTitleFetcher from "@/components/fileOperations/EpisodeTitleFetcher";
import FallingPetalsBackground from "@/components/stylingComponents/FallingPetalsBackground";

export default function Page() {
    return (
        <main className="min-h-screen max-h-screen min-h-screen h-screen">
            <FallingPetalsBackground animationSpeed={0.2} petalSize={0.8} petalMultiplier={1.5} />
            <EpisodeTitleFetcher />
        </main>
    );
}
