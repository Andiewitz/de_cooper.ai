"use client";

import type { ComponentType, SVGProps } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface TopicCardProps {
    id: string;
    title: string;
    description: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    onClick: () => void;
}

export default function TopicCard({ id, title, description, Icon, onClick }: TopicCardProps) {
    return (
        <motion.button
            type="button"
            layoutId={id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className={cx(
                "group flex w-full flex-col rounded-xl border border-secondary bg-primary p-5 text-left shadow-xs",
                "transition duration-100 ease-linear hover:border-brand hover:shadow-md",
            )}
            onClick={onClick}
        >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-secondary text-fg-brand-primary">
                <Icon className="size-5" aria-hidden />
            </div>
            <h3 className="text-md font-semibold text-primary">{title}</h3>
            <p className="mt-1 flex-1 text-sm text-tertiary line-clamp-3">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary transition duration-100 group-hover:text-brand-secondary_hover">
                Start lesson
                <ArrowRight className="size-4" aria-hidden />
            </span>
        </motion.button>
    );
}
