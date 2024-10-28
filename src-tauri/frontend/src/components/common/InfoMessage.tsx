import { BsInfoCircle } from "react-icons/bs";
import GlassCard from "@/components/layout/GlassCard";

export default function InfoMessage({ message }: { message: string | undefined }) {
    return (
        <GlassCard className="gap-2">
            <div className='flex flex-row bg-white bg-opacity-30 p-2 gap-2 overflow-hidden'>
                <div className='flex items-center'>
                    <BsInfoCircle className='h-5 w-5 align-sub inline' />
                </div>
                <div className='flex flex-grow'>
                    {message}
                </div>
            </div>
        </GlassCard>
    )
}