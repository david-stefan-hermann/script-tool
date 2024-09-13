import "./layered-background.css";

export default function LayeredBackground() {
    return (
        <div className={`layered-background`}>
            { /*
            <div className="w-screen h-screen relative overflow-hidden opacity-20">
                <img
                    src="/styling/background/clouds.webp"
                    alt="Background"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 min-w-full min-h-full object-cover"
                />
            </div>
            */ }

            <div className="w-full h-full fixed top-0 left-0 flex">
                <img
                    src="/styling/background/grid.svg"
                    alt="Background Grid"
                    className="w-full h-full"
                />
            </div>
            <div className="w-full h-full relative overflow-hidden opacity-20">
                <img
                    src="/styling/background/clouds.webp"
                    alt="Background Landscape"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 min-w-full min-h-full object-cover"
                />
            </div>

        </div>
    );
}