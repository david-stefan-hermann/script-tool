import { openInFileExplorer } from "@/services/tauriService";
import { Tooltip } from "@nextui-org/tooltip";
import { BsFolderFill } from "react-icons/bs";

export default function ControlsButtonExplorer() {

    const handleGoUp = async () => {
        await openInFileExplorer();
    };

    return (
        <Tooltip content="In Dateien öffnen" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoUp}
            >
                <BsFolderFill />
            </div>
        </Tooltip>
    );
}