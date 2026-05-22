"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
    chart: string;
    inline?: boolean;
}

export function MermaidRenderer({ chart, inline = true }: MermaidRendererProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

        const renderChart = async () => {
            try {
                // Dynamically import mermaid in browser only to prevent Next.js SSR crashes
                const mermaidMod = await import("mermaid");
                const mermaid = mermaidMod.default;

                mermaid.initialize({
                    startOnLoad: false,
                    theme: "base",
                    securityLevel: "loose",
                    themeVariables: {
                        /* Brand-aligned purple palette */
                        background: "#FEFCF8",
                        primaryColor: "#F4EBFF",        /* brand-200 — light purple node bg */
                        primaryTextColor: "#42307D",     /* brand-900 — deep purple text */
                        primaryBorderColor: "#9E77ED",   /* brand-500 — purple borders */
                        lineColor: "#D6BBFB",            /* brand-300 — purple connector lines */
                        secondaryColor: "#F9F5FF",       /* brand-50 — very light purple fills */
                        tertiaryColor: "#E9D7FE",        /* brand-200 — medium-light purple fills */
                        textColor: "#42307D",            /* brand-900 — deep purple text */
                        noteBkgColor: "#F9F5FF",         /* brand-50 */
                        noteTextColor: "#42307D",        /* brand-900 */
                        fontSize: "14px",
                        fontFamily: "Inter, system-ui, sans-serif",
                    },
                });

                const { svg: renderedSvg } = await mermaid.render(id, chart);
                if (isMounted) {
                    setSvg(renderedSvg);
                }
            } catch (err: any) {
                console.error("Mermaid rendering failed:", err);
                if (isMounted) {
                    setError("Could not render visual diagram.");
                }
            }
        };

        renderChart();

        return () => {
            isMounted = false;
        };
    }, [chart]);

    if (error) {
        return (
            <div
                className={
                    inline
                        ? "p-4 rounded-xl border border-brand/20 bg-brand-primary text-xs text-tertiary font-mono my-4"
                        : "p-4 text-xs text-tertiary font-mono max-w-full overflow-hidden"
                }
            >
                <span className="font-semibold block mb-1 text-brand-secondary text-[10px] uppercase tracking-wider">
                    Diagram Description
                </span>
                <pre className="overflow-x-auto whitespace-pre-wrap text-[10px]">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            ref={elementRef}
            className={
                inline
                    ? "flex items-center justify-center p-6 bg-brand-primary rounded-2xl border border-brand/20 my-6 overflow-hidden max-w-full w-full shadow-xs [&>svg]:max-w-full [&>svg]:h-auto"
                    : "flex items-center justify-center w-full h-full overflow-auto p-2 [&>svg]:max-w-full [&>svg]:h-auto"
            }
            dangerouslySetInnerHTML={{
                __html:
                    svg ||
                    '<div class="animate-pulse text-quaternary text-xs py-4">Drawing diagram...</div>',
            }}
        />
    );
}
