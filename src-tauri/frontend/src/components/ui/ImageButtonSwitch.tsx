import { Tooltip } from '@nextui-org/tooltip';
import React from 'react';
import "./glow-on-hover.css";
import "./borders.css";

interface ApiOptionTooltipProps {
    title: string;
    image: string;
    selected: boolean;
    borderStyle?: string;
    size?: number;
    onClick: () => void,
}

const ApiOptionTooltip: React.FC<ApiOptionTooltipProps> = ({
    title,
    image,
    selected,
    borderStyle = 'fire-border',
    size,
    onClick
}) => {

    return (
        <Tooltip content={title} placement="top" className='bg-white px-2 rounded border border-gray-100'>
            <div
                className={`
                    flex glow-on-hover cursor-pointer rounded-lg border-solid border-1
                    ${selected && borderStyle}`}
                onClick={() => onClick()}
                style={{
                    backgroundImage: `url(${image})`,
                    height: size + "rem",
                    width: size + "rem",
                }}
            >
            </div>
        </Tooltip>
    );
};

export default ApiOptionTooltip;