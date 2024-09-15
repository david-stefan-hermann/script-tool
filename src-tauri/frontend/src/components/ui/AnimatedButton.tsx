import "./glow-on-hover.css";

export function AnimatedButton({ text, onClick, image }: { text: string, onClick: () => void, image?: string }) {
    return (
        <a
            className="flex justify-center text-center px-4 py-2 glow-on-hover glow-on-hover-darken align-middle lg:text-base text-sm flex-grow"
            onClick={onClick}
            style={{ backgroundImage: "url(" + image + ")" }}>
            {text}
        </a>
    );
}