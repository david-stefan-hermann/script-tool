"use client";

import React, { useState } from 'react';
import GlassCard from './GlassCard';
import ImageButtonSwitch from '../ui/ImageButtonSwitch';
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image';

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

                <Image
                    width={10}
                    height={10}
                    className='w-20 h-20 p-1 glass-card-border-bottom hover:cursor-pointer'
                    src="/icon.png"
                    alt="Logo"
                    onClick={() => showTool("/windows/home")}
                    unoptimized
                />

                <div className="p-3 flex flex-col gap-3 items-center">
                    {toolOptions?.map((option, index) => (
                        <React.Fragment key={index}>
                            <ImageButtonSwitch
                                title={option.title}
                                image={option.image}
                                selected={getActiveTool(option.link)}
                                onClick={() => showTool(option.link)}
                                className='h-14 w-14'
                                borderStyle='arrow-border'
                            />
                        </React.Fragment>
                    ))}
                </div>
            </GlassCard>
        </nav>
    );
}