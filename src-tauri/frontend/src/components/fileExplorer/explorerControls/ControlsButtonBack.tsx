import { Tooltip } from "@nextui-org/tooltip";
import { BsArrowLeft } from "react-icons/bs";

interface ControlsButtonBackProps {
    handleGoUp: () => void;
}

export default function ControlsButtonBack({ handleGoUp }: ControlsButtonBackProps) {
    return (
        <Tooltip content="Zurück" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className="h-6 w-6 text-controls-100 inline mr-2 cursor-pointer hover:text-controls-200 active:text-controls-300"
                onClick={handleGoUp}
            >
                <BsArrowLeft />
            </div>
        </Tooltip>
    );
}