"use client";

import * as React from "react";
import { cx } from "@/utils/cx";

/* ─────────────────────────── Card ─────────────────────────── */

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cx(
            "rounded-xl border border-secondary/50 bg-primary/50 backdrop-blur-sm shadow-xs transition-shadow",
            className,
        )}
        {...props}
    />
));
Card.displayName = "Card";

/* ─────────────────────────── CardHeader ─────────────────────────── */

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cx("flex flex-col gap-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

/* ─────────────────────────── CardTitle ─────────────────────────── */

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cx("text-sm font-bold text-primary", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

/* ─────────────────────────── CardDescription ─────────────────────────── */

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cx("text-xs text-tertiary", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

/* ─────────────────────────── CardContent ─────────────────────────── */

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cx("p-6 pt-0", className)}
        {...props}
    />
));
CardContent.displayName = "CardContent";

/* ─────────────────────────── CardFooter ─────────────────────────── */

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cx("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
