import { Tooltip } from '@nextui-org/tooltip';
import React from 'react';
import "./glow-on-hover.css";

interface ApiOptionTooltipProps {
    title: string;
    image: string;
    selected: boolean;
    onClick: () => void,
}

const ApiOptionTooltip: React.FC<ApiOptionTooltipProps> = ({
    title,
    image,
    selected,
    onClick
}) => {
    return (
        <Tooltip content={title} placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`cursor-pointer h-16 w-16 ${selected && 'border-4 border-orange-500'}`}
                onClick={() => onClick()}
            >
                <img
                    src={image}
                    alt={title}
                    className='h-full w-full'
                />
            </div>
        </Tooltip>
    );
};

export default ApiOptionTooltip;