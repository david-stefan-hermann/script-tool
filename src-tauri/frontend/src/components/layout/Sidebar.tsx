"use client";

import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import ImageButtonSwitch from '../ui/ImageButtonSwitch';
import { usePathname, useRouter } from 'next/navigation'

type ToolOptions = {
    title: string;
    image: string;
    link: string;
};

export default function Sidebar() {

    const router = useRouter();
    const pathname = usePathname();
    const [toolOptions, setToolOptions] = useState<ToolOptions[]>();

    useState(() => {
        setToolOptions([
            {
                title: 'Video Dateien bearbeiten',
                image: '/styling/buttons/search.jpeg',
                link: "/windows/media-manipulator",
            },
            {
                title: 'QR Code Generator',
                image: '/styling/buttons/adjuster.jpg',
                link: "/windows/qr",
            }
        ]);
    });

    function showTool(option: string) {
        router.push(option);
    };

    function getActiveTool(path: string) {
        return pathname === path;
    }

    return (
        <nav className="flex flex-col h-screen w-20 min-w-20">
            <GlassCard className='h-full'>

                <img className='w-20 h-20 p-1 glass-card-border-bottom hover:cursor-pointer'
                    src="/icon.png"
                    alt="Logo"
                    onClick={() => showTool("/windows/home")} />

                <div className="p-2 flex flex-col gap-2 items-center">
                    {toolOptions?.map((option, index) => (
                        <React.Fragment key={index}>
                            <ImageButtonSwitch
                                title={option.title}
                                image={option.image}
                                selected={getActiveTool(option.link)}
                                onClick={() => showTool(option.link)}
                                scale={0.9} />
                        </React.Fragment>
                    ))}
                </div>
            </GlassCard>
        </nav>
    );
}