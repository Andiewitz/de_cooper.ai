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
            <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-secondary bg-primary px-8 py-14 text-center shadow-xs">
                <FeaturedIcon icon={icon} color="brand" theme="light" size="lg" />
                <h2 className="mt-6 font-display text-display-xs font-semibold text-primary">Coming soon</h2>
                <p className="mt-2 text-md text-tertiary">{description}</p>
            </div>
        </LearnDashboardLayout>
    );
}
