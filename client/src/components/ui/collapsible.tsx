"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/utils/cx";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

/* ── Animated Content ── */

interface CollapsibleContentProps
    extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> {
    /** Whether the collapsible is currently open — required for exit animation. */
    isOpen?: boolean;
}

const CollapsibleContent = React.forwardRef<
    React.ComponentRef<typeof CollapsiblePrimitive.Content>,
    CollapsibleContentProps
>(({ className, children, isOpen, ...props }, ref) => (
    <AnimatePresence initial={false}>
        {isOpen && (
            <CollapsiblePrimitive.Content ref={ref} forceMount asChild {...props}>
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={cx("overflow-hidden", className)}
                >
                    {children}
                </motion.div>
            </CollapsiblePrimitive.Content>
        )}
    </AnimatePresence>
));
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
