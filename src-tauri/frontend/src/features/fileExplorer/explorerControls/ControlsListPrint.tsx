import { useEffect, useState } from "react";
import { BsDeviceHddFill } from "react-icons/bs";
import ControlsDropUp from "./ControlsList";

interface ControlsListPrintProps {
    toggleListPrint: () => void;
}

export default function ControlsListPrint({ toggleListPrint }: ControlsListPrintProps) {

    return (
        <ControlsDropUp
            title='Laufwerke'
            isLoading={false}
            items={[
                {
                    item: [
                        <span>
                            <BsDeviceHddFill
                                className={`align-text-top h-5 w-5 
                                    text-dir
                                    inline mr-2`} />
                            Mediendateien in Verzeichnissen anzeigen
                        </span>
                    ],
                    onClick: () => console.log('Drucker: Mediendateien in Verzeichnissen anzeigen'),
                },
                {
                    item: [
                        <span>
                            <BsDeviceHddFill
                                className={`align-text-top h-5 w-5 
                                    text-dir
                                    inline mr-2`} />
                            Dateigrößen anzeigen
                        </span>
                    ],
                    onClick: () => console.log('Drucker: Dateigrößen anzeigen'),
                }
            ]}
            toggleDropUp={toggleListPrint}
        />
    );
}