import "./glass-card.css";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
    return (
        <div className={`w-full h-full flex flex-col glass-card ${className}`}>
            {children}
        </div>
    );
}