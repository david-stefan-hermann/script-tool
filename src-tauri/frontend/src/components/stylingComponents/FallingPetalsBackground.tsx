"use client";

import React, { useRef, useEffect } from 'react';

interface PetalProps {
    x: number;
    y: number;
    w: number;
    h: number;
    opacity: number;
    flip: number;
    xSpeed: number;
    ySpeed: number;
    flipSpeed: number;
}

interface FallingPetalsBackgroundProps {
    animationSpeed?: number; // Multiplier for animation speed
    petalSize?: number; // Multiplier for petal size
    petalMultiplier?: number; // Multiplier for number of petals
}

const petalArray: Petal[] = [];

const FallingPetalsBackground: React.FC<FallingPetalsBackgroundProps> = ({ animationSpeed = 1, petalSize = 1, petalMultiplier = 1 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const petalImgRef = useRef<HTMLImageElement | null>(null); // Initialize the image ref as null

    useEffect(() => {
        if (typeof window === 'undefined') return;  // Ensure `window` is only accessed on the client side

        const TOTAL = (window.innerWidth / 40) * petalMultiplier;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        // Resize canvas to window
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Ensure the Image is created only on the client side
        petalImgRef.current = new Image();
        petalImgRef.current.src = '/styling/petals/petal.png';

        petalImgRef.current.onload = () => {
            // Create petal objects
            for (let i = 0; i < TOTAL; i++) {
                petalArray.push(new Petal(canvas, ctx, petalImgRef.current!, animationSpeed, petalSize));
            }
            render();
        };

        // Animation function
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petalArray.forEach((petal) => petal.animate());
            requestAnimationFrame(render);
        };

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [animationSpeed, petalSize, petalMultiplier]);

    return <canvas className="fixed top-0 left-0 pointer-events-none" ref={canvasRef} />;
};

// Petal class
class Petal implements PetalProps {
    x: number;
    y: number;
    w: number;
    h: number;
    opacity: number;
    flip: number;
    xSpeed: number;
    ySpeed: number;
    flipSpeed: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    img: HTMLImageElement;
    animationSpeed: number;
    petalSize: number;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        animationSpeed: number,
        petalSize: number
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.img = img;
        this.animationSpeed = animationSpeed;
        this.petalSize = petalSize;

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 2 - canvas.height;
        this.w = petalSize * (25 + Math.random() * 15);
        this.h = petalSize * (20 + Math.random() * 10);
        this.opacity = this.w / 40;
        this.flip = Math.random();

        this.xSpeed = (1.5 + Math.random() * 2) * animationSpeed;
        this.ySpeed = (1 + Math.random()) * animationSpeed;
        this.flipSpeed = Math.random() * 0.03;
    }

    draw() {
        // Reset petal position if it moves off screen
        if (this.y > this.canvas.height || this.x > this.canvas.width) {
            this.x = -this.img.width;
            this.y = Math.random() * this.canvas.height * 2 - this.canvas.height;
            this.xSpeed = (1.5 + Math.random() * 2) * this.animationSpeed;
            this.ySpeed = (1 + Math.random()) * this.animationSpeed;
            this.flip = Math.random();
        }

        this.ctx.globalAlpha = this.opacity;
        this.ctx.drawImage(
            this.img,
            this.x,
            this.y,
            this.w * (0.6 + Math.abs(Math.cos(this.flip)) / 3),
            this.h * (0.8 + Math.abs(Math.sin(this.flip)) / 5)
        );
    }

    animate() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.flip += this.flipSpeed;
        this.draw();
    }
}

export default FallingPetalsBackground;
