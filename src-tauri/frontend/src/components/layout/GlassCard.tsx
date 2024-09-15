import "./glass-card.css";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    image?: string;
    bgClass?: string;
}

export default function GlassCard({ children, className, title, image, bgClass }: GlassCardProps) {
    return (
        <div className={`w-full flex flex-col glass-card ${className}`}>
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
                    <span className="z-10">{title}</span>
                </h1>
            }

            {children}
        </div>
    );
}