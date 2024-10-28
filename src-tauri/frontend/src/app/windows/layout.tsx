import FallingPetalsBackground from '@/components/layout/FallingPetalsBackground';
import LayeredBackground from '@/components/layout/LayeredBackground';
import Sidebar from '@/components/layout/Sidebar';
import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({
    children, // will be a page or nested layout
}: MainLayoutProps) {
    return (
        <section className='flex flex-row h-screen w-screen'>
            <LayeredBackground />
            <FallingPetalsBackground animationSpeed={0.2} petalSize={0.8} petalMultiplier={1.5} />
            <Sidebar />
            {children}
        </section>
    )
}