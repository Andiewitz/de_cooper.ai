"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
    chart: string;
}

export function MermaidRenderer({ chart }: MermaidRendererProps) {
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
                    theme: "neutral",
                    securityLevel: "loose",
                    themeVariables: {
                        background: "#FEFCF8",
                        primaryColor: "#4F46E5",
                        primaryTextColor: "#1E1B4B",
                        lineColor: "#E2E8F0",
                    }
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
            <div className="p-4 rounded-xl border border-secondary/60 bg-secondary/10 text-xs text-tertiary font-mono my-4">
                <span className="font-semibold block mb-1 text-quaternary text-[10px] uppercase tracking-wider">Diagram Description</span>
                <pre className="overflow-x-auto whitespace-pre-wrap">{chart}</pre>
            </div>
        );
    }

    return (
        <div 
            ref={elementRef}
            className="flex items-center justify-center p-6 bg-secondary/20 rounded-2xl border border-secondary/60 my-6 overflow-hidden max-w-full"
            dangerouslySetInnerHTML={{ 
                __html: svg || '<div class="animate-pulse text-quaternary text-xs py-4">Drawing dynamic diagram...</div>' 
            }}
        />
    );
}
