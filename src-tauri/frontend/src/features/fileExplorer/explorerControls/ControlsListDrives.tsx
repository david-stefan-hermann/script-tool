import { DriveInfo, listDrives } from "@/services/tauriService";
import { useEffect, useState } from "react";
import { BsDeviceHddFill } from "react-icons/bs";
import ControlsDropUp from "./ControlsList";

interface ControlsListDrivesProps {
    handleDirectoryClick: (path: string) => void;
    toggleListDrives: () => void;
}

export default function ControlsListDrives({ handleDirectoryClick, toggleListDrives }: ControlsListDrivesProps) {
    const [drives, setDrives] = useState<DriveInfo[]>([]);

    useEffect(() => {
        async function fetchDrives() {
            const drives = await listDrives();
            setDrives(drives);
        }

        fetchDrives();
    }, []);

    return (
        <ControlsDropUp
            title='Laufwerke'
            isLoading={drives.length <= 0}
            items={drives.map((drive) => ({
                item: [
                    <span>
                        <BsDeviceHddFill
                            className={`align-text-top h-5 w-5 
                                ${drive.is_offline ? 'text-error' : 'text-dir'}
                                inline mr-2`} />
                        {drive.letter} {drive.name && `(${drive.name})`}
                        {drive.is_offline && <span className="text-error"> offline</span>}
                    </span>
                ],
                onClick: () => !drive.is_offline && handleDirectoryClick(drive.letter),
            }))}
            toggleDropUp={toggleListDrives}
        />
    );
}