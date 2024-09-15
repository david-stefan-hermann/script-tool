import LoadingCircle from "@/components/common/LoadingCircle";
import { DriveInfo, listDrives } from "@/services/tauriService";
import { useEffect, useState } from "react";
import { BsDeviceHddFill, BsXLg } from "react-icons/bs";

interface controlsDriveList {
    handleDirectoryClick: (path: string) => void;
    handleListDrives: () => void;
    //drives: DriveInfo[];
}

export default function ControlsDriveList({ handleDirectoryClick, handleListDrives }: controlsDriveList) {
    const [drives, setDrives] = useState<DriveInfo[]>([]);

    useEffect(() => {
        async function fetchDrives() {
            const drives = await listDrives();
            setDrives(drives);
        }

        fetchDrives();
    }, []);

    useEffect(() => {
        console.log('ControlsDriveList.tsx: drives', drives.length);
    }, [drives]);

    return (
        <div className='glass-card'>
            <h2 className="flex flex-row justify-between text-lg font-bold px-2 py-1 gap-2">
                <span className="flex flex-grow">Laufwerke</span>
                <span className='flex inline'>
                    <LoadingCircle show={drives.length <= 0} />
                </span>
                <span onClick={handleListDrives} className='flex inline hover:cursor-pointer text-error'>
                    <BsXLg className="h-full w-full" />
                </span>
            </h2>
            <ul className='flex-col w-full max-h-full overflow-x-hidden flex-grow'>
                {drives.map((drive, index) => (
                    <li
                        key={drive.letter}
                        className={`py-1 pl-2 flex cursor-pointer break-all text-md
                            ${index % 2 === 0 ? 'bg-white bg-opacity-0' : 'bg-white bg-opacity-10'}
                            hover:text-dir hover:bg-white-200 hover:bg-opacity-40 transition-colors duration-200 glass-card-border-top`}
                        onClick={() => !drive.is_offline && handleDirectoryClick(drive.letter)}
                    >
                        <span>
                            <BsDeviceHddFill
                                className={`align-text-top h-5 w-5 
                                    ${drive.is_offline ? 'text-error' : 'text-dir'}
                                    inline mr-2`}
                            />
                            {drive.letter} {drive.name && `(${drive.name})`}
                            {drive.is_offline && <span className="text-error"> offline</span>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}