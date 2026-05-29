"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/utils/cx";

/* ── Re-exports ── */
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/* ── Content ── */

const DropdownMenuContent = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            asChild
            {...props}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                }}
                className={cx(
                    "z-50 min-w-[210px] overflow-hidden rounded-xl border border-secondary/60 bg-primary p-1.5 shadow-lg focus:outline-none",
                    className,
                )}
            >
                {children}
            </motion.div>
        </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/* ── Item ── */

const DropdownMenuItem = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cx(
            "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-secondary outline-none transition-colors hover:bg-primary_hover hover:text-primary focus:bg-primary_hover focus:text-primary data-disabled:pointer-events-none data-disabled:opacity-50",
            inset && "pl-8",
            className,
        )}
        {...props}
    />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/* ── Label ── */

const DropdownMenuLabel = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cx(
            "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-quaternary/60",
            inset && "pl-8",
            className,
        )}
        {...props}
    />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/* ── Separator ── */

const DropdownMenuSeparator = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cx("my-1.5 h-px bg-secondary", className)}
        {...props}
    />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

/* ── Shortcut ── */

const DropdownMenuShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
    <span
        className={cx(
            "ml-auto text-[10px] tracking-widest text-quaternary",
            className,
        )}
        {...props}
    />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuRadioGroup,
};
