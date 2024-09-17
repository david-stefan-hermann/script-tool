import "./glow-on-hover.css";
import { BiSolidDownload } from "react-icons/bi";

interface AnimatedButtonProps {
    text: string,
    onClick: () => void,
    image?: string
    download?: boolean
}

export function AnimatedButton({ text, onClick, image, download }: AnimatedButtonProps) {
    return (
        <a
            className="flex justify-center text-white text-center px-4 py-2 glow-on-hover glow-on-hover-darken align-middle lg:text-base text-sm flex-grow border-solid border-1 overflow-hidden"
            onClick={onClick}
            style={{
                backgroundImage: "url(" + image + ")",
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
            }}>
            {download && <><BiSolidDownload className="h-full text-controls-100 lg:text-xl text-lg" />&nbsp;</>}
            {text}
        </a>
    );
}