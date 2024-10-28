import { triggerRefresh } from "@/services/tauriService";
import { Tooltip } from "@nextui-org/tooltip";
import { BsArrowRepeat } from "react-icons/bs";

export default function ControlsButtonRefresh() {

    const handleGoUp = async () => {
        await triggerRefresh();
    };

    return (
        <Tooltip content="Ansicht aktualisieren" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoUp}
            >
                <BsArrowRepeat />
            </div>
        </Tooltip>
    );
}