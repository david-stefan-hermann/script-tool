import LoadingCircle from "@/components/common/LoadingCircle";
import GlassCard from "@/components/layout/GlassCard";
import { BsXLg } from "react-icons/bs";

interface controlsDropUpItems {
    item: React.ReactNode[];
    onClick: () => void;
}

interface controlsDropUp {
    title: string;
    isLoading: boolean;
    items: controlsDropUpItems[];
    toggleDropUp: () => void;
}

export default function ControlsDropUp({ title, isLoading, items, toggleDropUp }: controlsDropUp) {

    return (
        <GlassCard>
            <h2 className="flex flex-row justify-between text-xl font-bold px-2 py-1 gap-2">
                <span className="flex flex-grow">{title}</span>
                <span className='flex inline'>
                    <LoadingCircle show={isLoading} />
                </span>
                <span onClick={toggleDropUp} className='flex inline hover:cursor-pointer text-error'>
                    <BsXLg className="h-full w-full" />
                </span>
            </h2>
            <ul className='flex-col w-full max-h-full overflow-x-hidden flex-grow'>
                {items.map((item, index) => (
                    <li
                        key={index}
                        className={`py-1 pl-2 flex cursor-pointer break-all text-md
                            ${index % 2 === 0 ? 'bg-white bg-opacity-0' : 'bg-white bg-opacity-10'}
                            hover:text-dir hover:bg-white-200 hover:bg-opacity-40 transition-colors duration-200 glass-card-border-top`}
                        onClick={() => item.onClick()}
                    >
                        <span>
                            {item.item}
                        </span>
                    </li>
                ))}
            </ul>
        </GlassCard>
    );
}