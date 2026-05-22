"use client";

import type { FC } from "react";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";

interface LearnPlaceholderPageProps {
    title: string;
    subtitle: string;
    description: string;
    icon: FC<{ className?: string }>;
}

export function LearnPlaceholderPage({ title, subtitle, description, icon }: LearnPlaceholderPageProps) {
    return (
        <LearnDashboardLayout title={title} subtitle={subtitle}>
            <div className="mx-auto flex max-w-lg flex-col items-center px-8 py-20 text-center">
                <FeaturedIcon icon={icon} color="brand" theme="light" size="lg" />
                <h2 className="mt-6 font-display text-display-xs font-semibold text-primary">Coming soon</h2>
                <div className="mt-3 h-px w-16 bg-brand-secondary/40" />
                <p className="mt-4 text-md text-tertiary max-w-sm leading-relaxed">{description}</p>
            </div>
        </LearnDashboardLayout>
    );
}
