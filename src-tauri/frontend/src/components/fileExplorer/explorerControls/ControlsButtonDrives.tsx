import { Tooltip } from "@nextui-org/tooltip";
import { BsDeviceHddFill } from "react-icons/bs";

interface ControlsButtonDrivesProps {
    handleListDrives: () => void;
    showDrives: boolean;
}

export default function ControlsButtonDrives({ handleListDrives, showDrives }: ControlsButtonDrivesProps) {

    return (
        <Tooltip content="Laufwerke anzeigen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`inline mr-2 cursor-pointer ${showDrives ? 'text-controls-300 hover:text-controls-200' : 'text-controls-100 hover:text-controls-200'}`}
                onClick={handleListDrives}
            >
                <BsDeviceHddFill />
            </div>
        </Tooltip>
    );
}