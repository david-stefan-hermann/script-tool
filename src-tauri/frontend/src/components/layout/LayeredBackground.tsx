import Image from 'next/image';
import "./layered-background.css";

export default function LayeredBackground() {
    return (
        <div className={`layered-background`}>
            <div className="w-full h-full fixed top-0 left-0 flex">
                <Image
                    width={10}
                    height={10}
                    src="/styling/background/grid.svg"
                    alt="Background Grid"
                    className="w-full h-full"
                    unoptimized
                />
            </div>
            <div className="w-full h-full relative overflow-hidden opacity-20">
                <Image
                    width={10}
                    height={10}
                    src="/styling/background/clouds.webp"
                    alt="Background Landscape"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 min-w-full min-h-full object-cover"
                    unoptimized
                />
            </div>
        </div>
    );
}