"use client";

import { useEffect, useState } from "react";
import "./glass-card.css";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    image?: string;
    bgClass?: string;
    collapseable?: boolean;
    collapsed?: boolean;
    fullHeight?: boolean;
}

export default function GlassCard({ children, className, title, image, bgClass, collapseable, collapsed = false, fullHeight }: GlassCardProps) {

    const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed ? collapsed : false);

    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    function toggleCollapse() {
        setIsCollapsed(!isCollapsed);
    }

    return (
        <div className={`w-full flex flex-col glass-card ${className} ${(fullHeight && !isCollapsed) && "h-full"}`}>
            {title &&
                <h1 className='relative justify-center flex py-6 px-4 md:text-2xl text-xl text-purple-400 text-center font-anime glass-card-border-bottom'
                    style={{
                        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                    }}
                >
                    <span
                        className={`absolute top-0 left-0 opacity-80 h-full w-full bg-cover
                            ${bgClass ? bgClass : "bg-center"}
                            `}
                        style={{
                            backgroundImage: `${image && "url(" + image + ")"}`,
                            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                        }}
                    ></span>
                    <span className="z-10">
                        {title}
                        &nbsp;
                        {
                            collapseable &&
                            <span
                                className='absolute right-0 p-2 cursor-pointer text-controls-100 hover:text-controls-200 active:text-controls-300'
                                onClick={toggleCollapse}
                            >
                                {isCollapsed ? <BsFillCaretDownFill /> : <BsFillCaretUpFill />}
                            </span>
                        }
                    </span>
                </h1>
            }
            {!isCollapsed && children}
        </div>
    );
}