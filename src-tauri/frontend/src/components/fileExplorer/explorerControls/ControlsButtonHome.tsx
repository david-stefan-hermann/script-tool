import { goToHomeDirectory } from "@/services/tauriService";
import { Tooltip } from "@nextui-org/tooltip";
import { BsHouseFill } from "react-icons/bs";

interface ControlsButtonHomeProps {
    handleGoHome: () => void;
}

export default function ControlsButtonHome() {

    const handleGoHome = async () => {
        await goToHomeDirectory();
    }

    return (
        <Tooltip content="Zum Home Verzeichnis" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline mr-2 cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoHome}
            >
                <BsHouseFill />
            </div>
        </Tooltip>
    );
}