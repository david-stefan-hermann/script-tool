"use client";

import { BsPrinterFill } from "react-icons/bs";
import ControlsList from "./ControlsList";
import { printFileSizes, printMediaFilesInDirectories } from "@/services/tauriService";
import { useState } from "react";

interface ControlsListPrintProps {
    toggleListPrint: () => void;
    setIsLoading: (loading: boolean) => void;
}

export default function ControlsListPrint({ toggleListPrint, setIsLoading }: ControlsListPrintProps) {

    function handlePrintMediaFilesInDirectories() {
        toggleListPrint();
        setIsLoading(true);

        printMediaFilesInDirectories()
            .catch((error) => {
                console.error('Error printing media files in directories:', error);
                setIsLoading(false);
            })
            .finally(() => {
                setIsLoading(false);
            });

        console.log('Drucker: Mediendateien in Verzeichnissen anzeigen');
    };

    function handlePrintFileSizes() {
        toggleListPrint();
        setIsLoading(true);

        printFileSizes()
            .catch((error) => {
                console.error('Error printing file siyes:', error);
                setIsLoading(false);
            })
            .finally(() => {
                setIsLoading(false);
            });

        console.log('Drucker: Dateigrößen anzeigen');
    };

    return (
        <ControlsList
            title='Laufwerke'
            isLoading={false}
            items={[
                {
                    item: [
                        <div
                            key={0}
                            className='text-controls-100 hover:text-controls-200 active:text-controls-300 min-w-full'
                        >
                            <BsPrinterFill
                                className={`align-text-top h-5 w-5 inline mr-2`} />
                            Mediendateien in Verzeichnissen anzeigen
                        </div>
                    ],
                    onClick: () => handlePrintMediaFilesInDirectories(),
                },
                {
                    item: [
                        <div
                            key={1}
                            className='text-controls-100 hover:text-controls-200 active:text-controls-300'
                        >
                            <BsPrinterFill
                                className={`align-text-top h-5 w-5 inline mr-2`} />
                            Dateigrößen anzeigen
                        </div>
                    ],
                    onClick: () => handlePrintFileSizes(),
                }
            ]}
            toggleDropUp={toggleListPrint}
        />
    );
}