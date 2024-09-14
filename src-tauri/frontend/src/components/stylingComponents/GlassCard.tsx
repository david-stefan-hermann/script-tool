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
                <h1 className={`flex md:text-2xl text-xl font-anime bg-[#89CBDD] ${bgClass ? bgClass : "bg-center"}`}
                    style={{ backgroundImage: `${image && "url(" + image + ")"}` }}
                >{title}</h1>
            }

            {children}
        </div>
    );
}