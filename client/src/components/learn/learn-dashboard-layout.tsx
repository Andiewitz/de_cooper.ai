"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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

const WORKSPACES = [
    "Personal Workspace",
    "Caltech Physics Lab",
    "MIT Chem Study Group",
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
    const [activeWorkspace, setActiveWorkspace] = useState(WORKSPACES[0]);

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
            <aside className="flex h-full w-full flex-col bg-primary relative overflow-visible">
                {/* ── Header: Workspace Switcher Dropdown ── */}
                <div
                    className={cx(
                        "flex items-center border-b border-secondary py-4",
                        isCollapsed ? "flex-col justify-center gap-2 px-2" : "justify-between gap-2 px-4",
                    )}
                >
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className={cx(
                                    "flex w-full items-center gap-2.5 rounded-lg border border-secondary/50 bg-primary/40 p-2 text-left hover:bg-primary_hover transition select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/40",
                                    isCollapsed ? "justify-center" : ""
                                )}
                            >
                                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-white font-bold text-sm shadow-sm">
                                    {activeWorkspace[0]}
                                </div>
                                {!isCollapsed && (
                                    <div className="grid flex-1 leading-tight min-w-0">
                                        <span className="truncate text-sm font-bold text-primary">{activeWorkspace}</span>
                                        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-quaternary/70">STEM Workspace</span>
                                    </div>
                                )}
                                {!isCollapsed && (
                                    <ChevronRight className="size-4 shrink-0 text-fg-quaternary transition duration-150" />
                                )}
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="z-50 min-w-[210px] rounded-xl border border-secondary/60 bg-primary p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 focus:outline-none"
                                align="start"
                                side={isCollapsed ? "right" : "bottom"}
                                sideOffset={8}
                            >
                                <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-quaternary/60">
                                    Switch Workspaces
                                </DropdownMenu.Label>
                                {WORKSPACES.map((ws) => (
                                    <DropdownMenu.Item
                                        key={ws}
                                        onClick={() => setActiveWorkspace(ws)}
                                        className={cx(
                                            "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-secondary outline-none hover:bg-primary_hover hover:text-primary transition focus:bg-primary_hover",
                                            ws === activeWorkspace ? "font-semibold text-primary bg-secondary/30" : ""
                                        )}
                                    >
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-secondary/80 text-xs font-bold text-secondary">
                                            {ws[0]}
                                        </div>
                                        <span className="flex-1 truncate">{ws}</span>
                                        {ws === activeWorkspace && (
                                            <span className="text-brand-solid font-bold text-xs">✓</span>
                                        )}
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    {!forceExpanded && (
                        <Button
                            color="tertiary"
                            size="sm"
                            className="hidden shrink-0 lg:inline-flex"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            iconLeading={isCollapsed ? ChevronRight : ChevronLeft}
                            onClick={toggleCollapsed}
                        />
                    )}
                </div>

                {/* ── Main Navigation List ── */}
                <nav className={cx("flex flex-1 flex-col gap-1 py-4 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
                    
                    {/* Home Link */}
                    <Link
                        href="/learn"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg outline-focus-ring transition duration-150 select-none",
                            pathname === "/learn" ? "bg-secondary text-primary font-bold" : "hover:bg-primary_hover text-secondary",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                    >
                        <Home01 className={cx("size-5 shrink-0 transition-colors", pathname === "/learn" ? "text-fg-brand-primary" : "text-fg-quaternary group-hover/item:text-fg-quaternary_hover")} />
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
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        type="button"
                                        className={cx(
                                            "group/item flex w-full items-center justify-center rounded-lg p-2.5 outline-none hover:bg-primary_hover text-secondary transition",
                                            isAnyTopicActive ? "bg-secondary text-primary" : ""
                                        )}
                                    >
                                        <Beaker01 className={cx("size-5 shrink-0 transition-colors", isAnyTopicActive ? "text-fg-brand-primary" : "text-fg-quaternary group-hover/item:text-fg-quaternary_hover")} />
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        className="z-50 min-w-[180px] rounded-xl border border-secondary/60 bg-primary p-1.5 shadow-lg animate-in fade-in slide-in-from-left-2 duration-150 focus:outline-none"
                                        align="start"
                                        side="right"
                                        sideOffset={8}
                                    >
                                        <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-quaternary/60">
                                            STEM Modules
                                        </DropdownMenu.Label>
                                        {TOPIC_ITEMS.map((topic) => {
                                            const TopicIcon = topic.icon;
                                            return (
                                                <DropdownMenu.Item
                                                    key={topic.id}
                                                    onClick={() => {
                                                        router.push(`/learn/${topic.id}`);
                                                        setMobileNavOpen(false);
                                                    }}
                                                    className={cx(
                                                        "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition focus:bg-primary_hover",
                                                        isTopicRouteActive(topic.id) ? "font-semibold text-brand-secondary bg-brand-primary/40" : "text-secondary hover:text-primary"
                                                    )}
                                                >
                                                    <TopicIcon className="size-4 shrink-0 text-fg-quaternary" />
                                                    <span>{topic.label}</span>
                                                </DropdownMenu.Item>
                                            );
                                        })}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        ) : (
                            // Expanded Accordion Trigger
                            <>
                                <Collapsible.Trigger asChild>
                                    <button
                                        type="button"
                                        className={cx(
                                            "group/item flex w-full items-center justify-between rounded-lg p-2 text-sm font-semibold select-none cursor-pointer outline-none hover:bg-primary_hover transition duration-150",
                                            isAnyTopicActive ? "text-primary" : "text-secondary"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Beaker01 className={cx("size-5 shrink-0", isAnyTopicActive ? "text-fg-brand-primary" : "text-fg-quaternary")} />
                                            <span>Topics</span>
                                        </div>
                                        <ChevronRight
                                            className={cx(
                                                "size-4 text-fg-quaternary transition-transform duration-200",
                                                topicsOpen ? "rotate-90" : ""
                                            )}
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
                                                <div className="mt-1 border-l-2 border-secondary/80 pl-2.5 space-y-1">
                                                    {TOPIC_ITEMS.map((topic) => {
                                                        const TopicIcon = topic.icon;
                                                        const active = isTopicRouteActive(topic.id);
                                                        return (
                                                            <Link
                                                                key={topic.id}
                                                                href={`/learn/${topic.id}`}
                                                                onClick={() => setMobileNavOpen(false)}
                                                                className={cx(
                                                                    "group/sub flex items-center gap-2 rounded-md p-1.5 text-xs select-none transition duration-150",
                                                                    active ? "bg-brand-primary text-brand-secondary font-bold" : "hover:bg-primary_hover text-secondary hover:text-primary"
                                                                )}
                                                            >
                                                                <TopicIcon className={cx("size-4 shrink-0 transition-colors", active ? "text-brand-secondary" : "text-fg-quaternary group-hover/sub:text-fg-quaternary_hover")} />
                                                                <span>{topic.label}</span>
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
                            "group/item flex w-full items-center rounded-lg outline-focus-ring transition duration-150 select-none",
                            pathname.startsWith("/learn/calendar") ? "bg-secondary text-primary font-bold" : "hover:bg-primary_hover text-secondary",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                    >
                        <Calendar className={cx("size-5 shrink-0 transition-colors", pathname.startsWith("/learn/calendar") ? "text-fg-brand-primary" : "text-fg-quaternary group-hover/item:text-fg-quaternary_hover")} />
                        {!isCollapsed && <span className="text-sm font-semibold">Calendar</span>}
                    </Link>

                    {/* Leaderboards */}
                    <Link
                        href="/learn/leaderboards"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg outline-focus-ring transition duration-150 select-none",
                            pathname.startsWith("/learn/leaderboards") ? "bg-secondary text-primary font-bold" : "hover:bg-primary_hover text-secondary",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                    >
                        <Trophy01 className={cx("size-5 shrink-0 transition-colors", pathname.startsWith("/learn/leaderboards") ? "text-fg-brand-primary" : "text-fg-quaternary group-hover/item:text-fg-quaternary_hover")} />
                        {!isCollapsed && <span className="text-sm font-semibold">Leaderboards</span>}
                    </Link>

                    {/* Competitive Mode */}
                    <Link
                        href="/learn/competitive"
                        onClick={() => setMobileNavOpen(false)}
                        className={cx(
                            "group/item flex w-full items-center rounded-lg outline-focus-ring transition duration-150 select-none",
                            pathname.startsWith("/learn/competitive") ? "bg-secondary text-primary font-bold" : "hover:bg-primary_hover text-secondary",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                    >
                        <Atom01 className={cx("size-5 shrink-0 transition-colors", pathname.startsWith("/learn/competitive") ? "text-fg-brand-primary" : "text-fg-quaternary group-hover/item:text-fg-quaternary_hover")} />
                        {!isCollapsed && <span className="text-sm font-semibold">Competitive Mode</span>}
                    </Link>

                    {/* Docs for Devs */}
                    <a
                        href="https://github.com/Andiewitz/de_study.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(
                            "group/item flex w-full items-center rounded-lg outline-focus-ring transition duration-150 select-none hover:bg-primary_hover text-secondary",
                            isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-2"
                        )}
                    >
                        <FileCode01 className="size-5 shrink-0 text-fg-quaternary group-hover/item:text-fg-quaternary_hover" />
                        {!isCollapsed && <span className="text-sm font-semibold">Docs for devs</span>}
                    </a>

                </nav>

                {/* ── Footer: User Profile Dropdown ── */}
                <div className={cx("border-t border-secondary p-3", isCollapsed && "flex flex-col items-center gap-2")}>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className={cx(
                                    "flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-primary_hover transition duration-150 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/40",
                                    isCollapsed ? "justify-center" : ""
                                )}
                            >
                                <Avatar size="sm" initials={initials} alt={displayName} className="ring-2 ring-secondary/50 shadow-inner" />
                                {!isCollapsed && (
                                    <div className="min-w-0 flex-1 leading-tight">
                                        <p className="truncate text-sm font-bold text-primary">{displayName}</p>
                                        <p className="truncate text-[10px] text-tertiary">{user?.email}</p>
                                    </div>
                                )}
                                {!isCollapsed && <ChevronRight className="size-4 shrink-0 text-fg-quaternary" />}
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="z-50 min-w-[230px] rounded-2xl border border-secondary/60 bg-primary p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 focus:outline-none"
                                align={isCollapsed ? "start" : "end"}
                                side={isCollapsed ? "right" : "top"}
                                sideOffset={8}
                            >
                                <div className="flex items-center gap-3 px-3 py-2.5 select-none">
                                    <Avatar size="sm" initials={initials} alt={displayName} />
                                    <div className="min-w-0 flex-1 leading-tight">
                                        <p className="truncate text-sm font-bold text-primary">{displayName}</p>
                                        <p className="truncate text-[10px] text-tertiary">{user?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenu.Separator className="my-1.5 h-px bg-secondary" />
                                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-secondary outline-none hover:bg-primary_hover hover:text-primary transition focus:bg-primary_hover">
                                    <span className="text-amber-500 font-bold select-none text-base leading-none">✦</span>
                                    <span className="font-semibold text-brand-secondary">Upgrade to Pro</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-secondary outline-none hover:bg-primary_hover hover:text-primary transition focus:bg-primary_hover">
                                    <span className="text-fg-quaternary text-base leading-none">⚙</span>
                                    <span>Account & Settings</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-secondary outline-none hover:bg-primary_hover hover:text-primary transition focus:bg-primary_hover">
                                    <span className="text-fg-quaternary text-base leading-none">💳</span>
                                    <span>Billing details</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="my-1.5 h-px bg-secondary" />
                                <DropdownMenu.Item
                                    onClick={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-error-primary outline-none hover:bg-error-primary/10 hover:text-error-primary_hover transition focus:bg-error-primary/10"
                                >
                                    <LogOut01 className="size-4 shrink-0 text-fg-error-secondary" />
                                    <span className="font-semibold">Log out</span>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
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
                    "fixed inset-y-0 left-0 z-50 border-r border-secondary bg-primary transition-[width] duration-200 ease-linear lg:translate-x-0",
                    mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
                style={{ width: mobileNavOpen ? SIDEBAR_WIDTH_EXPANDED : sidebarWidth }}
            >
                <div className="flex h-12 items-center justify-end border-b border-secondary px-3 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="rounded-md p-2 text-fg-quaternary hover:bg-primary_hover"
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
