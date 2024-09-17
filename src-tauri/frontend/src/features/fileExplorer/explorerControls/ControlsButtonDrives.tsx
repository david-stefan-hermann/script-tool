import { Tooltip } from "@nextui-org/tooltip";
import { BsDeviceHddFill } from "react-icons/bs";

interface ControlsButtonDrivesProps {
    toggleListDrives: () => void;
    showDrives: boolean;
}

export default function ControlsButtonDrives({ toggleListDrives, showDrives }: ControlsButtonDrivesProps) {

    return (
        <Tooltip content="Laufwerke anzeigen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`inline cursor-pointer ${showDrives ? 'text-controls-300 hover:text-controls-200' : 'text-controls-100 hover:text-controls-200'}`}
                onClick={toggleListDrives}
            >
                <BsDeviceHddFill />
            </div>
        </Tooltip>
    );
}