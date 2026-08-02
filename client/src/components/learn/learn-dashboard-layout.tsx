"use client";

import { useState, type ReactNode } from "react";
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
    UsersIcon,
    SignalIcon,
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

// CS2-style mock friends list
const mockFriends = [
    { id: "1", name: "s1mple_stem", initials: "SS", status: "In Physics Lab", elo: "28k", online: true, dotColor: "bg-emerald-500" },
    { id: "2", name: "ZywOo_math", initials: "ZM", status: "Solving Calculus", elo: "29k", online: true, dotColor: "bg-emerald-500" },
    { id: "3", name: "m0NESY_ai", initials: "MA", status: "In AI Arena", elo: "25k", online: true, dotColor: "bg-blue-500" },
    { id: "4", name: "NiKo_cs", initials: "NC", status: "CS Module", elo: "22k", online: true, dotColor: "bg-purple-500" },
    { id: "5", name: "ropz_code", initials: "RC", status: "Reviewing Flashcards", elo: "24k", online: true, dotColor: "bg-emerald-500" },
    { id: "6", name: "b1t_math", initials: "BM", status: "Offline 2h ago", elo: "19k", online: false, dotColor: "bg-neutral-500" },
    { id: "7", name: "dev1ce_phy", initials: "DP", status: "Offline 1d ago", elo: "21k", online: false, dotColor: "bg-neutral-500" },
];

export function LearnDashboardLayout({ children, title, subtitle }: LearnDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [friendsOpen, setFriendsOpen] = useState(true);

    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const rawElo = user?.academic_elo ?? 4000;
    const eloDisplay = rawElo >= 1000 ? `${(rawElo / 1000).toFixed(rawElo % 1000 === 0 ? 0 : 1)}k` : `${rawElo}`;

    return (
        <div className="min-h-dvh bg-primary text-primary font-sans">
            {/* ── Top CS2 Navigation Bar (Width dynamically aligned with main content) ── */}
            <header className={cx(
                "sticky top-0 z-40 border-b border-secondary bg-primary/95 backdrop-blur-md transition-all duration-200",
                friendsOpen ? "mr-14 w-[calc(100%-3.5rem)]" : "w-full"
            )}>
                <div className="relative flex h-14 items-center justify-between px-3 sm:px-6 w-full">
                    
                    {/* Far Left: Brand & Utility Icons */}
                    <div className="flex items-center gap-3">
                        {/* Brand Logo */}
                        <Link href="/learn" className="font-logo text-base font-black tracking-tight text-primary select-none hover:text-brand-secondary transition-colors pr-2">
                            de_study.ai
                        </Link>

                        {/* Top Left Utility Icons (CS2 style) */}
                        <div className="flex items-center gap-0.5">
                            <Link
                                href="/learn"
                                title="Home"
                                className={cx(
                                    "p-1.5 rounded-md transition-colors cursor-pointer",
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
                                    "p-1.5 rounded-md transition-colors cursor-pointer",
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
                                    "p-1.5 rounded-md transition-colors cursor-pointer",
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
                                className="p-1.5 rounded-md text-tertiary hover:text-error-primary hover:bg-error-primary/10 transition-colors cursor-pointer"
                            >
                                <PowerIcon className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Center: Main CS2 Navigation Items (PLAY anchored to exact 50% center line) */}
                    <div className="hidden md:block select-none font-mono text-xs uppercase tracking-wider font-bold">
                        {/* Left links anchored to left of PLAY */}
                        <div className="absolute right-[calc(50%+4rem)] top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                            {/* 1. Learn */}
                            <Link
                                href="/learn"
                                className={cx(
                                    "px-3 py-1.5 rounded-md transition-all",
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
                                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                                    pathname.startsWith("/learn/competitive")
                                        ? "text-brand-secondary font-black"
                                        : "text-secondary hover:text-primary"
                                )}
                            >
                                <BeakerIcon className="size-3.5" />
                                <span>Labs</span>
                            </Link>
                        </div>

                        {/* 3. PLAY (Anchored to EXACT 50% Center Line) */}
                        <Link
                            href="/learn/physics"
                            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 group px-5 py-1.5 rounded-lg bg-brand-solid text-white font-extrabold text-xs tracking-widest uppercase shadow-md hover:bg-brand-solid/90 transition-all duration-200 flex items-center gap-1.5 scale-105 whitespace-nowrap"
                        >
                            <PlayIcon className="size-3.5 fill-white" />
                            <span>PLAY</span>
                        </Link>

                        {/* Right links anchored to right of PLAY */}
                        <div className="absolute left-[calc(50%+4rem)] top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                            {/* 4. Docs for nerds */}
                            <a
                                href="https://github.com/Andiewitz/de_study.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-md text-secondary hover:text-primary transition-all flex items-center gap-1.5"
                            >
                                <BookOpenIcon className="size-3.5" />
                                <span>Docs for nerds</span>
                            </a>

                            {/* 5. Calendars */}
                            <Link
                                href="/learn/calendar"
                                className={cx(
                                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                                    pathname.startsWith("/learn/calendar")
                                        ? "text-brand-secondary font-black"
                                        : "text-secondary hover:text-primary"
                                )}
                            >
                                <CalendarDaysIcon className="size-3.5" />
                                <span>Calendars</span>
                            </Link>
                        </div>
                    </div>

                    {/* Far Right: Social & Profile */}
                    <div className="flex items-center gap-2">
                        {/* ELO Rating Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-xs font-mono font-black tracking-tight select-none shadow-xs">
                            <SparklesIcon className="size-3 text-blue-200" />
                            <span className="text-blue-200 text-[10px] uppercase font-bold">ELO</span>
                            <span className="text-white font-black text-xs">{eloDisplay}</span>
                        </div>

                        {/* Friends sidebar toggle indicator */}
                        <button
                            type="button"
                            onClick={() => setFriendsOpen(!friendsOpen)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-tertiary hover:text-primary hover:bg-secondary/50 transition-colors"
                            title="Toggle Friends Sidebar"
                        >
                            <UsersIcon className="size-4" />
                            <span className="font-mono text-xs font-bold text-brand-secondary">18</span>
                        </button>

                        {/* Profile Avatar Dropdown */}
                        <Dropdown.Root>
                            <AriaButton className="flex items-center gap-2 rounded-full p-0.5 outline-none cursor-pointer">
                                <Avatar
                                    size="xs"
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
                <div className={cx(
                    "border-b border-secondary bg-secondary/20 px-4 py-4 sm:px-6 sm:py-5 transition-all duration-200",
                    friendsOpen ? "mr-14 w-[calc(100%-3.5rem)]" : "w-full"
                )}>
                    <div className="mx-auto max-w-6xl">
                        {title && <h1 className="font-display text-xl font-bold text-primary sm:text-2xl">{title}</h1>}
                        {subtitle && <p className="mt-1 text-sm text-tertiary">{subtitle}</p>}
                    </div>
                </div>
            )}

            {/* ── Main Content Area + Fixed Right Friends Sidebar (Full height) ── */}
            <div className="relative flex w-full min-h-[calc(100vh-3.5rem)]">
                {/* Main Content */}
                <main className={cx("flex-1 w-full transition-all duration-200", friendsOpen ? "mr-14" : "mr-0")}>
                    {children}
                </main>

                {/* CS2 Full-Height Right Friends Sidebar */}
                {friendsOpen && (
                    <aside className="fixed right-0 top-0 bottom-0 z-50 w-14 border-l border-secondary/60 bg-primary/95 backdrop-blur-md flex flex-col items-center justify-between py-3 select-none shadow-lg">
                        {/* Top: Social Icon & Online Count */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-secondary/40 text-brand-secondary font-mono text-xs font-extrabold" title="Online Friends: 18">
                                18
                            </div>
                            <div className="w-8 h-px bg-secondary/60 my-1" />
                        </div>

                        {/* Middle: Stack of Friend Avatars */}
                        <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto no-scrollbar py-2 w-full px-1">
                            {mockFriends.map((f) => (
                                <div key={f.id} className="relative group cursor-pointer shrink-0 flex items-center justify-center">
                                    <Avatar
                                        size="sm"
                                        initials={f.initials}
                                        alt={f.name}
                                        className="transition-transform group-hover:scale-105"
                                    />
                                    {/* Status Dot */}
                                    <span className={cx("absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-primary shrink-0", f.dotColor)} />

                                    {/* Hover Tooltip */}
                                    <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col z-[9999] w-36 p-2 rounded-lg bg-primary border border-secondary shadow-xl text-left pointer-events-none">
                                        <p className="text-xs font-bold text-primary truncate">{f.name}</p>
                                        <p className="text-[10px] text-tertiary truncate">{f.status}</p>
                                        <p className="text-[9px] font-mono font-bold text-brand-secondary mt-0.5">ELO: {f.elo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Utility (Clean & minimal) */}
                        <div className="flex flex-col items-center pt-2 border-t border-secondary/40 w-full px-2">
                            <button
                                type="button"
                                className="p-1.5 rounded-md text-tertiary hover:text-primary hover:bg-secondary/50 transition-colors"
                                title="Live Broadcast"
                            >
                                <SignalIcon className="size-4" />
                            </button>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
