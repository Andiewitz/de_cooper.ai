"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function ScrollProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis smooth scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard smooth-scroll easing
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        let frameId = 0;
        function raf(time: number) {
            lenis.raf(time);
            frameId = requestAnimationFrame(raf);
        }

        frameId = requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            cancelAnimationFrame(frameId);
        };
    }, []);

    return <>{children}</>;
}
