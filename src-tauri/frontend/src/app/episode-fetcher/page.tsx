import EpisodeTitleFetcher from "@/components/episodeTitleFetcher/EpisodeTitleFetcher";
import FallingPetalsBackground from "@/components/stylingComponents/FallingPetalsBackground";

export default function Page() {
    return (
        <main className="min-h-screen max-h-screen min-h-screen h-screen p-4">
            <FallingPetalsBackground animationSpeed={0.2} petalSize={0.8} petalMultiplier={1.5} />
            <EpisodeTitleFetcher />
        </main>
    );
}
