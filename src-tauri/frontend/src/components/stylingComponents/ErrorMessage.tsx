import { BsExclamationCircleFill } from "react-icons/bs";
import GlassCard from "./GlassCard";

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <GlassCard className="text-pink-600 gap-2">
            <div className="flex flex-row justify-center p-2">
                <div className='flex items-center'>
                    <BsExclamationCircleFill className="h-5 w-5 align-sub inline mr-2" />
                </div>
                <div className='flex flex-grow'>
                    {message}
                </div>
            </div>
        </GlassCard>
    );
}