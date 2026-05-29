"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { Placement } from "react-aria";
import { AnimatePresence, motion } from "framer-motion";
import { cx } from "@/utils/cx";

export type TooltipPlacement = Placement;

export interface TooltipProps {
    /**
     * The title / primary text of the tooltip.
     */
    title: ReactNode;
    /**
     * The description / supporting text of the tooltip.
     */
    description?: ReactNode;
    /**
     * The trigger element that receives hover / focus.
     */
    children: ReactNode;
    /**
     * Whether to show an arrow on the tooltip.
     * @default false
     */
    arrow?: boolean;
    /**
     * Delay in milliseconds before the tooltip is shown.
     * @default 300
     */
    delay?: number;
    /**
     * Delay in milliseconds before the tooltip is hidden.
     * @default 0
     */
    closeDelay?: number;
    /**
     * Whether the tooltip is disabled.
     */
    isDisabled?: boolean;
    /**
     * Programmatic open state.
     */
    isOpen?: boolean;
    /**
     * Initial open state.
     */
    defaultOpen?: boolean;
    /**
     * Distance between the trigger and the tooltip content.
     * @default 6
     */
    offset?: number;
    /**
     * Offset along the trigger's axis.
     */
    crossOffset?: number;
    /**
     * Preferred placement.
     * @default "top"
     */
    placement?: TooltipPlacement;
    /**
     * Callback triggered on open state change.
     */
    onOpenChange?: (open: boolean) => void;
}

export const Tooltip = ({
    title,
    description,
    children,
    arrow = false,
    delay = 300,
    closeDelay = 0,
    isDisabled = false,
    isOpen,
    defaultOpen,
    offset = 6,
    crossOffset = 0,
    placement = "top",
    onOpenChange,
}: TooltipProps) => {
    // Uncontrolled state fallback
    const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : localOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (isDisabled) return;
        if (!isControlled) {
            setLocalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    // Map placement strings to Radix compatible side property
    const sideMap: Record<string, "top" | "bottom" | "left" | "right"> = {
        top: "top",
        "top left": "top",
        "top right": "top",
        "top start": "top",
        "top end": "top",
        bottom: "bottom",
        "bottom left": "bottom",
        "bottom right": "bottom",
        "bottom start": "bottom",
        "bottom end": "bottom",
        left: "left",
        "left top": "left",
        "left bottom": "left",
        "left start": "left",
        "left end": "left",
        right: "right",
        "right top": "right",
        "right bottom": "right",
        "right start": "right",
        "right end": "right",
        start: "left",
        end: "right",
    };

    // Map placement strings to Radix compatible align property
    const alignMap: Record<string, "start" | "center" | "end"> = {
        top: "center",
        bottom: "center",
        left: "center",
        right: "center",
        start: "center",
        end: "center",
        "top start": "start",
        "top end": "end",
        "bottom start": "start",
        "bottom end": "end",
        "left start": "start",
        "left end": "end",
        "right start": "start",
        "right end": "end",
        "top left": "start",
        "top right": "end",
        "bottom left": "start",
        "bottom right": "end",
        "left top": "start",
        "left bottom": "end",
        "right top": "start",
        "right bottom": "end",
    };

    const side = sideMap[placement] || "top";
    const align = alignMap[placement] || "center";

    return (
        <RadixTooltip.Provider delayDuration={delay} skipDelayDuration={closeDelay}>
            <RadixTooltip.Root open={isDisabled ? false : open} onOpenChange={handleOpenChange}>
                <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
                <AnimatePresence>
                    {open && !isDisabled && (
                        <RadixTooltip.Portal forceMount>
                            <RadixTooltip.Content
                                forceMount
                                side={side}
                                align={align}
                                sideOffset={offset}
                                alignOffset={crossOffset}
                                asChild
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: side === "top" ? 4 : side === "bottom" ? -4 : 0, x: side === "left" ? 4 : side === "right" ? -4 : 0 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: side === "top" ? 4 : side === "bottom" ? -4 : 0, x: side === "left" ? 4 : side === "right" ? -4 : 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 28,
                                    }}
                                    className={cx(
                                        "z-50 flex max-w-xs flex-col items-start gap-1 rounded-lg px-3 shadow-lg select-none pointer-events-none border border-black/5 dark:border-white/5",
                                        "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
                                        description ? "py-2.5" : "py-1.5"
                                    )}
                                >
                                    <span className="text-xs font-semibold leading-tight">{title}</span>
                                    {description && (
                                        <span className="text-[10px] font-medium opacity-80 leading-normal">
                                            {description}
                                        </span>
                                    )}
                                    {arrow && (
                                        <RadixTooltip.Arrow className="fill-neutral-900 dark:fill-white" />
                                    )}
                                </motion.div>
                            </RadixTooltip.Content>
                        </RadixTooltip.Portal>
                    )}
                </AnimatePresence>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
};

// Legacy trigger wrapper for drop-in compatibility
export interface TooltipTriggerProps {
    children: ReactNode;
    className?: string;
    /** Accepted for API compat with react-aria; no-op on this wrapper. */
    isDisabled?: boolean;
}

export const TooltipTrigger = ({ children, className }: TooltipTriggerProps) => {
    return (
        <span className={cx("inline-block", className)}>
            {children}
        </span>
    );
};
