import React from 'react';
import { FolderIcon, DocumentIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { BsDeviceHdd, BsArrowLeft, BsHouse, BsHdd, BsX } from "react-icons/bs";

interface BreadCrumbsProps {
    onClickFunction: (path: string) => void;
    hierarchy: DirectoryHierarchy[];
};

interface DirectoryHierarchy {
    full_path: string,
    dir_name: string,
}

export default function BreadCrumbs({ onClickFunction, hierarchy }: BreadCrumbsProps) {

    return (
        <div className="flex flex-wrap text-md">
            {hierarchy.slice().reverse().map((directory, index) => (
                <div key={index} className="flex items-center">
                    <button
                        className="hover:text-blue-500"
                        onClick={() => onClickFunction(directory.full_path)}
                    >
                        {index > 0 ?
                            <>
                                <span className="mx-1">&gt;</span>
                                <FolderIcon className="align-text-top h-5 w-5 text-blue-500 inline mr-1" />
                            </>
                            :
                            <BsDeviceHdd className="align-text-top h-5 w-5 text-blue-500 inline mr-1" />
                        }
                        {directory.dir_name}
                    </button>
                </div>
            ))}
        </div>
    );
}