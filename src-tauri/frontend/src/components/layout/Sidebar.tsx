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
                image: '/styling/buttons/video.jpg',
                link: "/windows/media-manipulator",
            },
            {
                title: 'QR Code Generator',
                image: '/styling/buttons/qr.jpg',
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
        <React.Fragment>
            <div className='h-full'>
                <GlassCard fullHeight className='w-auto py-4'>
                    <div className='flex h-full justify-center glass-card-border-top glass-card-border-bottom'>
                    <div className="px-2 py-3 flex flex-col gap-3 items-center">
                        <h2>Apps</h2>
                        {toolOptions?.map((option, index) => (
                            <React.Fragment key={index}>
                                <ImageButtonSwitch
                                    title={option.title}
                                    image={option.image}
                                    selected={getActiveTool(option.link)}
                                    onClick={() => showTool(option.link)}
                                    size={3.5}
                                    borderStyle='thunder-border'
                                    />
                            </React.Fragment>
                        ))}
                    </div>
                        </div>
                </GlassCard>
            </div>
        </React.Fragment>
    );
}