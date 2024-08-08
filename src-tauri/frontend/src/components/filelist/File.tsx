import { Tooltip } from "@nextui-org/tooltip";

type FileInfo = {
    path: string;
    is_dir: boolean;
    name: string;
};

type FileProps = {
    index: number;
    file: FileInfo;
    onClickFunction: (path: string) => void;
};

export default function File({ index, file, onClickFunction }: FileProps) {
    return (
        <Tooltip content={file.path} key={index}>
            <li
                className={`py-2 px-4 cursor-pointer ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                    } hover:bg-gray-200 transition-colors duration-200`}
                onClick={() => { file.is_dir && onClickFunction(file.path) }}
            >
                <span>
                    {file.is_dir ? (
                        <span>{"d: "}</span>
                    ) : (
                        <span>{"f: "}</span>
                    )}
                    {file.name}
                </span>
            </li>
        </Tooltip>
    );
}