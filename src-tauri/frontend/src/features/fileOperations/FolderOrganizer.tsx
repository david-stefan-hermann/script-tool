import { useState } from "react";
import GlassCard from "@/components/layout/GlassCard";
import { pullFilesFromFolders, putFilesInFolders } from "@/services/tauriService";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function FolderOrganizer() {

    const [error, setError] = useState<string | null>(null);

    function handlePutFilesInFolders() {
        setError(null);
        putFilesInFolders()
            .then(() => {
                console.log("Files moved successfully");
            })
            .catch((err) => {
                console.error("Failed to move files:", err);
                setError("Failed to move files: " + err);
            });
    }

    function handlePullFilesFromFolders() {
        setError(null);
        pullFilesFromFolders()
            .then(() => {
                console.log("Files pulled successfully");
            })
            .catch((err) => {
                console.error("Failed to pull files:", err);
                setError("Failed to pull files: " + err);
            });
    }

    return (
        <GlassCard className='' title='Dateien Organisieren' image='/styling/backsplash/green.jpg'>
            <div className="flex flex-col gap-2 p-2">

                {error && <ErrorMessage message={error}></ErrorMessage>}

                <AnimatedButton text="In Ordner packen" onClick={() => handlePutFilesInFolders()} image='/styling/buttons/button-blue.jpg' />
                <AnimatedButton text="aus Ordnern ziehen" onClick={() => handlePullFilesFromFolders()} image='/styling/buttons/button-purple.jpg' />
            </div>
        </GlassCard>
    );
}