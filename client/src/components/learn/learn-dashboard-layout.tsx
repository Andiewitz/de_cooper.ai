"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    HomeIcon,
    TvIcon,
    Cog6ToothIcon,
    PowerIcon,
    BeakerIcon,
    BookOpenIcon,
    CalendarDaysIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@/components/base/avatar/avatar";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Button as AriaButton } from "react-aria-components";
import { useAuth } from "@/providers/auth-provider";
import { cx } from "@/utils/cx";

interface LearnDashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function LearnDashboardLayout({ children, title, subtitle }: LearnDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // User ELO display (defaults to 4k or formatted user ELO)
    const rawElo = user?.academic_elo ?? 4000;
    const eloDisplay = rawElo >= 1000 ? `${(rawElo / 1000).toFixed(rawElo % 1000 === 0 ? 0 : 1)}k` : `${rawElo}`;

    return (
        <div className="min-h-dvh bg-primary text-primary font-sans">
            {/* ── Top HUD Navigation Bar (No heavy borders or CS badges) ── */}
            <header className="sticky top-0 z-40 w-full border-b border-secondary bg-primary/90 backdrop-blur-md transition-all duration-200">
                <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
                    
                    {/* Far Left: Brand & Utility Icons */}
                    <div className="flex items-center gap-4">
                        {/* Brand Logo */}
                        <Link href="/learn" className="font-logo text-lg font-black tracking-tight text-primary select-none hover:text-brand-secondary transition-colors">
                            de_study.ai
                        </Link>

                        {/* Utility Icons (Clean & Borderless) */}
                        <div className="flex items-center gap-1">
                            <Link
                                href="/learn"
                                title="Home"
                                className={cx(
                                    "p-2 rounded-lg transition-colors cursor-pointer",
                                    pathname === "/learn"
                                        ? "text-brand-secondary bg-brand-secondary/10 font-bold"
                                        : "text-tertiary hover:text-primary hover:bg-secondary/50"
                                )}
                            >
                                <HomeIcon className="size-4" />
                            </Link>

                            <Link
                                href="/learn/leaderboards"
                                title="TV & Leaderboards"
                                className={cx(
                                    "p-2 rounded-lg transition-colors cursor-pointer",
                                    pathname === "/learn/leaderboards"
                                        ? "text-brand-secondary bg-brand-secondary/10 font-bold"
                                        : "text-tertiary hover:text-primary hover:bg-secondary/50"
                                )}
                            >
                                <TvIcon className="size-4" />
                            </Link>

                            <Link
                                href="/settings"
                                title="Settings"
                                className={cx(
                                    "p-2 rounded-lg transition-colors cursor-pointer",
                                    pathname === "/settings"
                                        ? "text-brand-secondary bg-brand-secondary/10 font-bold"
                                        : "text-tertiary hover:text-primary hover:bg-secondary/50"
                                )}
                            >
                                <Cog6ToothIcon className="size-4" />
                            </Link>

                            <button
                                type="button"
                                title="Log out"
                                onClick={() => {
                                    logout();
                                    router.push("/login");
                                }}
                                className="p-2 rounded-lg text-tertiary hover:text-error-primary hover:bg-error-primary/10 transition-colors cursor-pointer"
                            >
                                <PowerIcon className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Center: Clean Navigation Bar (PLAY in center) */}
                    <nav className="flex items-center gap-2 sm:gap-4 font-mono text-xs uppercase tracking-widest font-bold select-none">
                        {/* 1. Learn */}
                        <Link
                            href="/learn"
                            className={cx(
                                "px-3.5 py-2 rounded-lg transition-all",
                                pathname === "/learn"
                                    ? "text-brand-secondary font-black"
                                    : "text-secondary hover:text-primary"
                            )}
                        >
                            Learn
                        </Link>

                        {/* 2. Labs */}
                        <Link
                            href="/learn/competitive"
                            className={cx(
                                "px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5",
                                pathname.startsWith("/learn/competitive")
                                    ? "text-brand-secondary font-black"
                                    : "text-secondary hover:text-primary"
                            )}
                        >
                            <BeakerIcon className="size-3.5" />
                            <span>Labs</span>
                        </Link>

                        {/* 3. PLAY (Center & Highlighted) */}
                        <Link
                            href="/learn/physics"
                            className="relative group px-6 py-2.5 rounded-xl bg-brand-solid text-white font-extrabold text-sm tracking-wider uppercase shadow-md hover:bg-brand-solid/90 transition-all duration-200 flex items-center gap-2 scale-105"
                        >
                            <PlayIcon className="size-4 fill-white" />
                            <span>PLAY</span>
                        </Link>

                        {/* 4. Docs for nerds */}
                        <a
                            href="https://github.com/Andiewitz/de_study.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-lg text-secondary hover:text-primary transition-all flex items-center gap-1.5"
                        >
                            <BookOpenIcon className="size-3.5" />
                            <span>Docs for nerds</span>
                        </a>

                        {/* 5. Calendars */}
                        <Link
                            href="/learn/calendar"
                            className={cx(
                                "px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5",
                                pathname.startsWith("/learn/calendar")
                                    ? "text-brand-secondary font-black"
                                    : "text-secondary hover:text-primary"
                            )}
                        >
                            <CalendarDaysIcon className="size-3.5" />
                            <span>Calendars</span>
                        </Link>
                    </nav>

                    {/* Far Right: User Profile & 4k ELO */}
                    <div className="flex items-center gap-3">
                        {/* ELO Rating Badge (Blue for 4k) */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-mono font-black tracking-tight select-none shadow-xs">
                            <SparklesIcon className="size-3.5 text-blue-200" />
                            <span className="text-blue-200 text-[10px] uppercase font-bold">ELO</span>
                            <span className="text-white font-black text-sm">{eloDisplay}</span>
                        </div>

                        {/* Profile Picture Avatar & Dropdown */}
                        <Dropdown.Root>
                            <AriaButton className="flex items-center gap-2 rounded-full p-0.5 outline-none cursor-pointer">
                                <Avatar
                                    size="sm"
                                    initials={initials}
                                    alt={displayName}
                                    className="ring-2 ring-brand-secondary/40"
                                />
                            </AriaButton>
                            <Dropdown.Popover
                                placement="bottom right"
                                className="z-[9999] w-60 rounded-xl bg-primary border border-secondary shadow-xl p-1"
                            >
                                <div className="flex items-center gap-3 p-3 border-b border-secondary">
                                    <Avatar size="sm" initials={initials} alt={displayName} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-primary">{displayName}</p>
                                        <p className="truncate text-xs text-tertiary">{user?.email || "4k ELO"}</p>
                                    </div>
                                </div>
                                <Dropdown.Menu className="py-1">
                                    <Dropdown.Item
                                        onAction={() => router.push("/learn/upgrade")}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary cursor-pointer"
                                    >
                                        ✦ Upgrade to Pro
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onAction={() => router.push("/settings")}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary cursor-pointer"
                                    >
                                        ⚙ Account & Settings
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onAction={() => router.push("/billing")}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary cursor-pointer"
                                    >
                                        💳 Billing details
                                    </Dropdown.Item>
                                    <Dropdown.Separator className="my-1 h-px bg-secondary" />
                                    <Dropdown.Item
                                        onAction={() => {
                                            logout();
                                            router.push("/login");
                                        }}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-error-primary hover:bg-error-primary/10 cursor-pointer"
                                    >
                                        🚪 Log out
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </div>

                </div>
            </header>

            {/* Page Header (if provided) */}
            {(title || subtitle) && (
                <div className="border-b border-secondary bg-secondary/20 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mx-auto max-w-6xl">
                        {title && <h1 className="font-display text-xl font-bold text-primary sm:text-2xl">{title}</h1>}
                        {subtitle && <p className="mt-1 text-sm text-tertiary">{subtitle}</p>}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
