import { Tooltip } from '@nextui-org/tooltip';
import React, { useEffect } from 'react';
import "./glow-on-hover.css";
import "./fire-border.css";

interface ApiOptionTooltipProps {
    title: string;
    image: string;
    selected: boolean;
    scale?: number;
    onClick: () => void,
}

const ApiOptionTooltip: React.FC<ApiOptionTooltipProps> = ({
    title,
    image,
    selected,
    scale,
    onClick
}) => {

    return (
        <Tooltip content={title} placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`flex glow-on-hover cursor-pointer ${selected && 'fire-border'}`}
                onClick={() => onClick()}
                style={{ 
                    backgroundImage: `url(${image})`, 
                    width: scale ? (scale * 4) + 'rem' : '4rem',
                    height: scale ? (scale * 4) + 'rem' : '4rem',
                }}
            >
            </div>
        </Tooltip>
    );
};

export default ApiOptionTooltip;