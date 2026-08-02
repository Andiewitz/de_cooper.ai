"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/providers/auth-provider";
import OnboardingWizard from "@/components/onboarding-wizard";
import { LearnDashboardLayout } from "@/components/learn/learn-dashboard-layout";
import { Avatar } from "@/components/base/avatar/avatar";

// CS2 Premier ELO tier color system
function getEloTier(elo: number) {
    if (elo >= 30000) return { bg: "#2A2000", stripe: "#D4A017", text: "#F5C518" };
    if (elo >= 25000) return { bg: "#2A0808", stripe: "#CC1111", text: "#FF4444" };
    if (elo >= 20000) return { bg: "#1E0030", stripe: "#AA00CC", text: "#CC44FF" };
    if (elo >= 15000) return { bg: "#001233", stripe: "#1A56C8", text: "#4C9BFF" };
    if (elo >= 10000) return { bg: "#001820", stripe: "#0097A7", text: "#00D6F0" };
    if (elo >= 5000)  return { bg: "#000E33", stripe: "#2962FF", text: "#6699FF" };
    return                 { bg: "#0D1C26", stripe: "#3B8FA8", text: "#5FC8E0" };
}

function PremierBadge({ elo }: { elo: number }) {
    const tier = getEloTier(elo);
    const eloFormatted = elo.toLocaleString();

    return (
        /* Slanted box with sharp square edges (~20% scaled down) */
        <div
            className="-skew-x-[12deg] relative flex items-center shadow-xl overflow-hidden rounded-none"
            style={{ background: tier.bg, height: 28, minWidth: 84 }}
        >
            {/* The 2 slanted vertical lines */}
            <div className="flex gap-0.5 pl-2.5 pr-1.5 py-1 shrink-0 h-full items-center">
                <div className="w-1 h-full" style={{ background: tier.stripe }} />
                <div className="w-1 h-full" style={{ background: tier.stripe }} />
            </div>

            {/* ELO Number only (unskewed text) */}
            <div className="skew-x-[12deg] pr-3 pl-1 flex items-center justify-center select-none">
                <span
                    className="font-black text-xs leading-none tracking-tight tabular-nums italic"
                    style={{ color: tier.text, textShadow: `0 0 8px ${tier.stripe}66` }}
                >
                    {eloFormatted}
                </span>
            </div>
        </div>
    );
}

export default function LearnPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return null;
    if (!isAuthenticated) return null;

    if (user && !user.onboarding_completed) {
        return <OnboardingWizard onClose={() => {}} />;
    }

    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const rawElo = user?.academic_elo ?? 4000;

    return (
        <LearnDashboardLayout>
            <div className="flex flex-col items-center justify-center w-full min-h-[75vh] pt-32 space-y-3 select-none text-center">

                {/* Profile Avatar (20% smaller: size-24 / 3xl) */}
                <Avatar
                    size="3xl"
                    initials={initials}
                    alt={displayName}
                    className="ring-4 ring-blue-500/20 shadow-2xl"
                />

                {/* CS2 Premier Rank Badge (~20% smaller) */}
                <PremierBadge elo={rawElo} />

                {/* Name below badge (20% smaller) */}
                <div className="flex items-center justify-center gap-1.5 font-sans font-semibold text-base text-primary tracking-tight">
                    <ShieldCheckIcon className="size-4 text-blue-500 shrink-0" />
                    <span>{displayName}</span>
                </div>

            </div>
        </LearnDashboardLayout>
    );
}
