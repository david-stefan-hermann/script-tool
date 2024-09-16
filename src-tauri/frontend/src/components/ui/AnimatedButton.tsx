import "./glow-on-hover.css";

export function AnimatedButton({ text, onClick, image }: { text: string, onClick: () => void, image?: string }) {
    return (
        <a
            className="flex justify-center text-center px-4 py-2 glow-on-hover glow-on-hover-darken align-middle lg:text-base text-sm flex-grow border-solid border-2 border-controls-100"
            onClick={onClick}
            style={{
                backgroundImage: "url(" + image + ")",
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
            }}>
            {text}
        </a>
    );
}