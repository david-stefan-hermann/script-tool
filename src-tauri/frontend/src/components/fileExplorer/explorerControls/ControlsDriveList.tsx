import { DriveInfo } from "@/services/tauriService";
import { Tooltip } from "@nextui-org/tooltip";
import { BsDeviceHddFill, BsX } from "react-icons/bs";

interface controlsDriveList {
    handleDirectoryClick: (path: string) => void;
    handleListDrives: () => void;
    drives: DriveInfo[];
}

export default function ControlsDriveList({ drives, handleDirectoryClick, handleListDrives }: controlsDriveList) {
    return (
        <div className='glass-card'>
            <h2 className="flex justify-between text-lg font-bold px-2 py-1">
                <span>Laufwerke</span>
                <span onClick={handleListDrives}>
                    <Tooltip content="Schließen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
                        <BsX className='h-6 w-6 inline hover:cursor-pointer' />
                    </Tooltip>
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