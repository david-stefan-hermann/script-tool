import LoadingCircle from "@/components/common/LoadingCircle";
import GlassCard from "@/components/layout/GlassCard";
import { BsXLg } from "react-icons/bs";

interface controlsListItems {
    item: React.ReactNode[];
    onClick: () => void;
}

interface controlsList {
    title: string;
    isLoading: boolean;
    items: controlsListItems[];
    className?: string;
    toggleDropUp: () => void;
}

export default function ControlsList({ title, isLoading, items, className, toggleDropUp }: controlsList) {

    return (
        <GlassCard className={className}>
            <h2 className="flex flex-row justify-between text-xl font-bold px-2 py-1 gap-2">
                <span className="flex flex-grow">{title}</span>
                <span className='flex inline'>
                    <LoadingCircle show={isLoading} />
                </span>
                <span onClick={toggleDropUp} className='flex inline hover:cursor-pointer text-error'>
                    <div>
                        <BsXLg className="h-full w-full" />
                    </div>
                </span>
            </h2>
            <ul className='flex-col w-full max-h-full overflow-x-hidden flex-grow'>
                {items.map((item, index) => (
                    <li
                        key={"list" + index}
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