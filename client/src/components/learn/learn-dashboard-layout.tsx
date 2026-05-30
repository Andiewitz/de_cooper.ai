"use client";

import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Atom01,
    Beaker01,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileCode01,
    Home01,
    LogOut01,
    Menu01,
    SearchLg,
    Trophy01,
    X,
    BookOpen01,
    Calculator,
    Code01,
    Globe01,
} from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import * as Collapsible from "@radix-ui/react-collapsible";
import { AnimatePresence, motion } from "framer-motion";
import { Button as AriaButton } from "react-aria-components";
import { useAuth } from "@/providers/auth-provider";
import { cx } from "@/utils/cx";

const SIDEBAR_STORAGE_KEY = "destudy-sidebar-collapsed";
const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const TOPIC_ITEMS = [
    { id: "physics", label: "Physics", icon: Atom01 },
    { id: "mathematics", label: "Mathematics", icon: Calculator },
    { id: "computer-science", label: "Computer Science", icon: Code01 },
    { id: "chemistry", label: "Chemistry", icon: Beaker01 },
    { id: "astronomy", label: "Astronomy", icon: Globe01 },
    { id: "general", label: "Ask Anything", icon: BookOpen01 },
];


interface LearnDashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function LearnDashboardLayout({ children, title, subtitle }: LearnDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [topicsOpen, setTopicsOpen] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored === "true") {
            setCollapsed(true);
        }
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            return next;
        });
    };

    const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // Check if any topic sub-route is currently active
    const isTopicRouteActive = (topicId: string) => pathname === `/learn/${topicId}`;
    const isAnyTopicActive = TOPIC_ITEMS.some((t) => isTopicRouteActive(t.id));

    const sidebar = (forceExpanded = false) => {
        const isCollapsed = forceExpanded ? false : collapsed;

        return (
            <aside className="flex h-full w-full flex-col" style={{ background: "var(--color-brand-900)" }}>
                {/* ── Header: App Branding ── */}
                <div
                    className={cx(
                        "flex items-center py-4",
                        isCollapsed ? "flex-col justify-center gap-2 px-2" : "justify-between gap-2 px-4",
                    )}
                    style={{ borderBottom: "1px solid rgb(255 255 255 / 0.10)" }}
                >
                    {isCollapsed ? (
                        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm shadow-sm select-none" style={{ background: "var(--color-accent-500)", color: "#fff" }}>
                            C
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 px-1 select-none min-w-0">
                            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm shadow-sm" style={{ background: "var(--color-accent-500)", color: "#fff" }}>
                                C
                            </div>
                            <div className="grid leading-tight min-w-0">
                                <span className="truncate text-sm font-bold" style={{ color: "#fff" }}>de Cooper</span>
                                <span className="truncate text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgb(214 187 251)" }}>STEM Learning</span>
                            </div>
                        </div>
                    )}

                    {!forceExpanded && (
                        <button
                            type="button"
                            className="hidden shrink-0 lg:inline-flex items-center justify-center rounded-md p-1.5 transition duration-150"
                            style={{ color: "rgb(214 187 251)", background: "transparent" }}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            onClick={toggleCollapsed}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgb(255 255 255 / 0.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                        </button>
                    )}
                </div>

                {/* ── Main Navigation List ── */}
                <nav className={cx("flex flex-1 flex-col gap-0.5 py-4 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>

                    {/* Home Link */}
                    <Link
                        href="/learn"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg transition duration-150 select-none outline-none",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                        style={pathname === "/learn"
                            ? { background: "var(--color-accent-500)", color: "#fff" }
                            : { color: "rgb(214 187 251)" }
                        }
                        onMouseEnter={e => { if (pathname !== "/learn") (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { if (pathname !== "/learn") (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <Home01 className={cx("size-5 shrink-0 transition-colors", pathname === "/learn" ? "" : "")} style={{ color: pathname === "/learn" ? "#fff" : "var(--color-accent-300)" }} />
                        {!isCollapsed && <span className="text-sm font-semibold">Home</span>}
                    </Link>

                    {/* Collapsible Topics Accordion */}
                    <Collapsible.Root
                        open={isCollapsed ? false : topicsOpen}
                        onOpenChange={setTopicsOpen}
                        className="w-full"
                    >
                        {isCollapsed ? (
                            // Collapsed Popover Trigger for Topics
                            <Dropdown.Root>
                                <AriaButton
                                    className="group/item flex w-full items-center justify-center rounded-lg p-2.5 outline-none transition"
                                    style={isAnyTopicActive
                                        ? { background: "var(--color-accent-500)", color: "#fff" }
                                        : { color: "rgb(214 187 251)" }
                                    }
                                >
                                    <Beaker01 className="size-5 shrink-0" style={{ color: isAnyTopicActive ? "#fff" : "var(--color-accent-300)" }} />
                                </AriaButton>
                                <Dropdown.Popover
                                    placement="right top"
                                    className="z-[9999] w-56 rounded-b-xl bg-secondary_alt"
                                >
                                    <Dropdown.Menu className="rounded-b-xl bg-primary ring-1 ring-secondary">
                                        <Dropdown.SectionHeader className="px-4 pt-1.5 pb-0.5 text-xs font-semibold text-brand-secondary">
                                            STEM Modules
                                        </Dropdown.SectionHeader>
                                        {TOPIC_ITEMS.map((topic) => {
                                            const TopicIcon = topic.icon;
                                            const active = isTopicRouteActive(topic.id);
                                            return (
                                                <Dropdown.Item
                                                    key={topic.id}
                                                    id={topic.id}
                                                    onAction={() => {
                                                        router.push(`/learn/${topic.id}`);
                                                        setMobileNavOpen(false);
                                                    }}
                                                    selectionIndicator={active ? "checkmark" : "none"}
                                                >
                                                    <TopicIcon className="size-4 shrink-0 text-fg-quaternary mr-2" />
                                                    <span>{topic.label}</span>
                                                </Dropdown.Item>
                                            );
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown.Root>
                        ) : (
                            // Expanded Accordion Trigger
                            <>
                                <Collapsible.Trigger asChild>
                                    <button
                                        type="button"
                                        className="group/item flex w-full items-center justify-between rounded-lg p-2 text-sm font-semibold select-none cursor-pointer outline-none transition duration-150"
                                        style={{ color: isAnyTopicActive ? "#fff" : "rgb(214 187 251)" }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Beaker01 className="size-5 shrink-0" style={{ color: isAnyTopicActive ? "var(--color-accent-300)" : "var(--color-accent-300)" }} />
                                            <span>Topics</span>
                                        </div>
                                        <ChevronRight
                                            className={cx("size-4 transition-transform duration-200", topicsOpen ? "rotate-90" : "")}
                                            style={{ color: "rgb(182 146 246)" }}
                                        />
                                    </button>
                                </Collapsible.Trigger>
                                <AnimatePresence initial={false}>
                                    {topicsOpen && (
                                        <Collapsible.Content asChild>
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden pl-3"
                                            >
                                                <div className="mt-1 pl-2.5 space-y-0.5" style={{ borderLeft: "2px solid rgb(255 255 255 / 0.15)" }}>
                                                    {TOPIC_ITEMS.map((topic) => {
                                                        const TopicIcon = topic.icon;
                                                        const active = isTopicRouteActive(topic.id);
                                                        return (
                                                            <Link
                                                                key={topic.id}
                                                                href={`/learn/${topic.id}`}
                                                                onClick={() => setMobileNavOpen(false)}
                                                                className="group/sub flex items-center gap-2 rounded-md p-1.5 text-xs select-none transition duration-150 outline-none"
                                                                style={active
                                                                    ? { background: "var(--color-accent-500)", color: "#fff" }
                                                                    : { color: "rgb(214 187 251)" }
                                                                }
                                                                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                                                                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                                            >
                                                                <TopicIcon className="size-4 shrink-0" style={{ color: active ? "#fff" : "var(--color-accent-300)" }} />
                                                                <span className={active ? "font-bold" : ""}>{topic.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        </Collapsible.Content>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </Collapsible.Root>

                    {/* Calendar */}
                    <Link
                        href="/learn/calendar"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg transition duration-150 select-none outline-none",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                        style={pathname.startsWith("/learn/calendar")
                            ? { background: "var(--color-accent-500)", color: "#fff" }
                            : { color: "rgb(214 187 251)" }
                        }
                        onMouseEnter={e => { if (!pathname.startsWith("/learn/calendar")) (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { if (!pathname.startsWith("/learn/calendar")) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <Calendar className="size-5 shrink-0" style={{ color: pathname.startsWith("/learn/calendar") ? "#fff" : "var(--color-accent-300)" }} />
                        {!isCollapsed && <span className="text-sm font-semibold">Calendar</span>}
                    </Link>

                    {/* Leaderboards */}
                    <Link
                        href="/learn/leaderboards"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg transition duration-150 select-none outline-none",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                        style={pathname.startsWith("/learn/leaderboards")
                            ? { background: "var(--color-accent-500)", color: "#fff" }
                            : { color: "rgb(214 187 251)" }
                        }
                        onMouseEnter={e => { if (!pathname.startsWith("/learn/leaderboards")) (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { if (!pathname.startsWith("/learn/leaderboards")) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <Trophy01 className="size-5 shrink-0" style={{ color: pathname.startsWith("/learn/leaderboards") ? "#fff" : "var(--color-accent-300)" }} />
                        {!isCollapsed && <span className="text-sm font-semibold">Leaderboards</span>}
                    </Link>

                    {/* Competitive Mode */}
                    <Link
                        href="/learn/competitive"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg transition duration-150 select-none outline-none",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                        style={pathname.startsWith("/learn/competitive")
                            ? { background: "var(--color-accent-500)", color: "#fff" }
                            : { color: "rgb(214 187 251)" }
                        }
                        onMouseEnter={e => { if (!pathname.startsWith("/learn/competitive")) (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { if (!pathname.startsWith("/learn/competitive")) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <Atom01 className="size-5 shrink-0" style={{ color: pathname.startsWith("/learn/competitive") ? "#fff" : "var(--color-accent-300)" }} />
                        {!isCollapsed && <span className="text-sm font-semibold">Competitive Mode</span>}
                    </Link>

                    {/* Docs for Devs */}
                    <a
                        href="https://github.com/Andiewitz/de_study.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(
                            "group/item flex w-full items-center rounded-lg transition duration-150 select-none outline-none",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                        style={{ color: "rgb(214 187 251)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        <FileCode01 className="size-5 shrink-0" style={{ color: "var(--color-accent-300)" }} />
                        {!isCollapsed && <span className="text-sm font-semibold">Docs for devs</span>}
                    </a>

                </nav>

                {/* ── Footer: User Profile Dropdown ── */}
                <div
                    className={cx("relative p-3", isCollapsed && "flex flex-col items-center gap-2")}
                    style={{ borderTop: "1px solid rgb(255 255 255 / 0.10)" }}
                >
                    <Dropdown.Root>
                        <AriaButton
                            className={cx(
                                "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition duration-150 select-none cursor-pointer outline-none",
                                isCollapsed ? "justify-center" : ""
                            )}
                            style={{ color: "#fff" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                            <Avatar size="sm" initials={initials} alt={displayName} className="ring-2 ring-[rgba(255,255,255,0.25)] shadow-inner" />
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1 leading-tight">
                                    <p className="truncate text-sm font-bold" style={{ color: "#fff" }}>{displayName}</p>
                                    <p className="truncate text-[10px]" style={{ color: "rgb(214 187 251)" }}>{user?.email}</p>
                                </div>
                            )}
                            {!isCollapsed && <ChevronRight className="size-4 shrink-0" style={{ color: "rgb(182 146 246)" }} />}
                        </AriaButton>
                        <Dropdown.Popover
                            placement={isCollapsed ? "right bottom" : "top right"}
                            className="z-[9999] w-[230px] rounded-xl bg-primary shadow-lg ring-1 ring-secondary overflow-hidden"
                        >
                            <div className="flex items-center gap-3 px-3.5 py-3 select-none border-b border-secondary bg-primary">
                                <Avatar size="sm" initials={initials} alt={displayName} />
                                <div className="min-w-0 flex-1 leading-tight">
                                    <p className="truncate text-sm font-bold text-primary">{displayName}</p>
                                    <p className="truncate text-[10px] text-tertiary">{user?.email}</p>
                                </div>
                            </div>
                            <Dropdown.Menu className="bg-primary">
                                <Dropdown.Item
                                    onAction={() => router.push("/learn/upgrade")}
                                >
                                    <span className="font-bold select-none text-base leading-none mr-2" style={{ color: "var(--color-accent-500)" }}>✦</span>
                                    <span className="font-semibold text-brand-secondary">Upgrade to Pro</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onAction={() => router.push("/settings")}
                                >
                                    <span className="text-fg-quaternary text-base leading-none mr-2">⚙</span>
                                    <span>Account & Settings</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onAction={() => router.push("/billing")}
                                >
                                    <span className="text-fg-quaternary text-base leading-none mr-2">💳</span>
                                    <span>Billing details</span>
                                </Dropdown.Item>
                                <Dropdown.Separator />
                                <Dropdown.Item
                                    onAction={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                    className="text-error-primary hover:bg-error-primary/10 hover:text-error-primary_hover focus:bg-error-primary/10"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <LogOut01 className="size-4 shrink-0 text-fg-error-secondary" />
                                        <span className="font-semibold">Log out</span>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>
            </aside>
        );
    };

    return (
        <div className="min-h-dvh bg-primary" style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}>
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-overlay/60 lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* Sidebar Shell */}
            <div
                className={cx(
                    "fixed inset-y-0 left-0 z-50 transition-[width] duration-200 ease-linear lg:translate-x-0",
                    mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
                style={{ width: mobileNavOpen ? SIDEBAR_WIDTH_EXPANDED : sidebarWidth, background: "var(--color-brand-900)", borderRight: "1px solid rgb(255 255 255 / 0.08)" }}
            >
                <div className="flex h-12 items-center justify-end px-3 lg:hidden" style={{ borderBottom: "1px solid rgb(255 255 255 / 0.10)" }}>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="rounded-md p-2 transition"
                        style={{ color: "rgb(214 187 251)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgb(255 255 255 / 0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        onClick={() => setMobileNavOpen(false)}
                    >
                        <X className="size-5" />
                    </button>
                </div>
                {sidebar(mobileNavOpen)}
            </div>

            {/* Main Content Pane */}
            <div className="transition-[padding] duration-200 ease-linear lg:pl-(--sidebar-width)">
                <header className="sticky top-0 z-30 border-b border-secondary bg-primary/95 backdrop-blur-md">
                    <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            aria-label="Open menu"
                            className="rounded-md p-2 text-fg-quaternary hover:bg-primary_hover lg:hidden"
                            onClick={() => setMobileNavOpen(true)}
                        >
                            <Menu01 className="size-5" />
                        </button>

                        <div className="min-w-0 flex-1">
                            {title && (
                                <h1 className="truncate font-display text-lg font-semibold text-primary sm:text-xl">{title}</h1>
                            )}
                            {subtitle && <p className="truncate text-sm text-tertiary">{subtitle}</p>}
                        </div>

                        <div className="hidden w-full max-w-sm sm:block sm:max-w-xs lg:max-w-sm">
                            <Input size="sm" aria-label="Search courses" placeholder="Search topics..." icon={SearchLg} />
                        </div>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
