import { Tooltip } from "@nextui-org/tooltip";
import { BsPrinterFill } from "react-icons/bs";

interface ControlsButtonPrintProps {
    toggleListPrint: () => void;
    showPrint: boolean;
}

export default function ControlsButtonPrint({ toggleListPrint, showPrint }: ControlsButtonPrintProps) {

    return (
        <Tooltip content="Dateien Drucken" placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`inline mr-2 cursor-pointer ${showPrint ? 'text-controls-300 hover:text-controls-200' : 'text-controls-100 hover:text-controls-200'}`}
                onClick={toggleListPrint}
            >
                <BsPrinterFill />
            </div>
        </Tooltip>
    );
}