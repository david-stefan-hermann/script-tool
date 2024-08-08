import { Tooltip } from "@nextui-org/tooltip";
import { FolderIcon, DocumentIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

type FileInfo = {
    path: string;
    is_dir: boolean;
    is_video: boolean;
    name: string;
};

type FileProps = {
    index: number;
    file: FileInfo;
    onClickFunction: (path: string) => void;
};

export default function File({ index, file, onClickFunction }: FileProps) {
    return (
        <li
            key={index}
            className={`py-1 px-4 flex cursor-pointer ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                } hover:bg-gray-200 transition-colors duration-200`}
            onClick={() => { file.is_dir && onClickFunction(file.path) }}
        >
            <span>
                {selectFolderIcon(file)}
                {file.name}
            </span>
        </li>
    );
}

function selectFolderIcon(file: FileInfo) {
    if (file.is_dir) {
        return (
            <FolderIcon className="h-5 w-5 text-blue-500 inline mr-2" />
        )
    } else if (file.is_video) {
        return (
            <VideoCameraIcon className="h-5 w-5 text-red-500 inline mr-2" />
        )
    } else {
        return (
            <DocumentIcon className="h-5 w-5 text-blue-500 inline mr-2" />
        )
    }
}