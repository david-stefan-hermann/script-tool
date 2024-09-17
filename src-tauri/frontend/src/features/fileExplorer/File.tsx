import { BsFileEarmarkFill, BsFolderFill, BsFileEarmarkPlayFill } from "react-icons/bs";
import { FileInfo } from '@/services/tauriService';

type FileProps = {
    index: number;
    file: FileInfo;
    onClickFunction: (path: string) => void;
};

export default function File({ index, file, onClickFunction }: FileProps) {
    return (
        <>
            <li
                key={index}
                className={`py-1 pl-2 flex cursor-pointer break-all glass-card-border-top hover:bg-white-200 hover:bg-opacity-40 transition-colors duration-200
                    ${file.is_dir ? ' hover:text-dir' : ''}`}
                style={{
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => { file.is_dir && onClickFunction(file.path) }}
            >
                <span className="flex items-center">
                    {selectFolderIcon(file)}
                </span>
                <span className="flex">
                    {file.name}
                </span>
            </li>
        </>
    );
}

function selectFolderIcon(file: FileInfo) {
    if (file.is_dir) {
        return (
            <BsFolderFill className="align-text-top h-5 w-5 text-dir inline mr-2" />
        )
    } else if (file.is_video) {
        return (
            <BsFileEarmarkPlayFill className="align-text-top h-5 w-5 text-media inline mr-2" />
        )
    } else {
        return (
            <BsFileEarmarkFill className="align-text-top h-5 w-5 text-inactive inline mr-2" />
        )
    }
}
