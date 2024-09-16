import { Tooltip } from '@nextui-org/tooltip';
import React from 'react';
import "./glow-on-hover.css";
import "./fire-border.css";
import "./arrow-border.css";

interface ApiOptionTooltipProps {
    title: string;
    image: string;
    selected: boolean;
    borderStyle?: string;
    className?: string;
    onClick: () => void,
}

const ApiOptionTooltip: React.FC<ApiOptionTooltipProps> = ({
    title,
    image,
    selected,
    borderStyle = 'fire-border',
    className,
    onClick
}) => {

    return (
        <Tooltip content={title} placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`
                    flex glow-on-hover cursor-pointer h-20 w-20
                    ${selected && borderStyle}
                    ${className}
                    `}
                onClick={() => onClick()}
                style={{
                    backgroundImage: `url(${image})`,
                }}
            >
            </div>
        </Tooltip>
    );
};

export default ApiOptionTooltip;