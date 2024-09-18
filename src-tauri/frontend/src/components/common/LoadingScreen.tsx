import GlassCard from "../layout/GlassCard";
import { AnimatedButton } from "../ui/AnimatedButton";
import LoadingCircle from "./LoadingCircle";
import './Loading.css';
import ReactDOM from "react-dom";

interface LoadingScreenProps {
    message: string;
    onClick?: () => void;
}

export default function LoadingScreen({ message, onClick }: LoadingScreenProps) {
    return ReactDOM.createPortal(
        <>
            <div className="fixed top-0 left-0 z-10 h-full w-full">
                <GlassCard fullHeight className="justify-center items-center">
                    <div className=''>
                        <GlassCard title={message} image="/styling/backsplash/green.jpg">
                            <div className='p-2 flex flex-col overflow-x-hidden'>
                                <div className="p-8 text-controls-100">
                                    <LoadingCircle show={true} />
                                </div>
                                <div className='flex flex-row w-full'>
                                    {onClick &&
                                        <AnimatedButton text="Abbrechen" onClick={onClick} image='/styling/buttons/button-purple.jpg' />
                                    }
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </GlassCard>
            </div>
        </>,
        document.body // Render at the top level of the DOM
    );
}