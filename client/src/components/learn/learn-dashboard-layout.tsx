"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
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
} from "@untitledui/icons";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { cx } from "@/utils/cx";

const SIDEBAR_STORAGE_KEY = "destudy-sidebar-collapsed";
const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const TOPIC_IDS = new Set(["physics", "mathematics", "computer-science", "chemistry", "astronomy", "general"]);

type NavItem = {
    label: string;
    href: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    external?: boolean;
    isActive?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
    {
        label: "Home",
        href: "/learn",
        icon: Home01,
        isActive: (pathname) => pathname === "/learn",
    },
    {
        label: "Sandbox",
        href: "/learn",
        icon: Beaker01,
        isActive: (pathname) => {
            const segment = pathname.split("/")[2];
            return Boolean(segment && TOPIC_IDS.has(segment));
        },
    },
    {
        label: "Calendar",
        href: "/learn/calendar",
        icon: Calendar,
        isActive: (pathname) => pathname.startsWith("/learn/calendar"),
    },
    {
        label: "Leaderboards",
        href: "/learn/leaderboards",
        icon: Trophy01,
        isActive: (pathname) => pathname.startsWith("/learn/leaderboards"),
    },
    {
        label: "Competitive for Nerds",
        href: "/learn/competitive",
        icon: Atom01,
        isActive: (pathname) => pathname.startsWith("/learn/competitive"),
    },
    {
        label: "Docs for devs",
        href: "https://github.com/Andiewitz/de_study.ai",
        icon: FileCode01,
        external: true,
        isActive: () => false,
    },
];

interface LearnDashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

function SidebarNavItem({
    item,
    collapsed,
    current,
    onNavigate,
}: {
    item: NavItem;
    collapsed: boolean;
    current: boolean;
    onNavigate?: () => void;
}) {
    const Icon = item.icon;
    const linkClass = cx(
        "group/item flex w-full cursor-pointer items-center rounded-md bg-primary outline-focus-ring transition duration-100 ease-linear select-none",
        "hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
        current && "bg-secondary hover:bg-secondary_hover",
        collapsed ? "justify-center p-2.5" : "gap-2 p-2",
    );

    const content = (
        <>
            <Icon
                aria-hidden
                className={cx(
                    "size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover",
                    current && "text-fg-quaternary_hover",
                )}
            />
            {!collapsed && (
                <span
                    className={cx(
                        "flex-1 truncate text-sm font-semibold text-secondary transition-inherit-all group-hover/item:text-secondary_hover",
                        current && "text-secondary_hover",
                    )}
                >
                    {item.label}
                </span>
            )}
        </>
    );

    const link =
        item.external ? (
            <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                onClick={onNavigate}
            >
                {content}
            </a>
        ) : (
            <Link href={item.href} className={linkClass} onClick={onNavigate} aria-current={current ? "page" : undefined}>
                {content}
            </Link>
        );

    if (collapsed) {
        return (
            <Tooltip title={item.label} placement="right">
                {link}
            </Tooltip>
        );
    }

    return link;
}

export function LearnDashboardLayout({ children, title, subtitle }: LearnDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

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

    const sidebar = (forceExpanded = false) => {
        const isCollapsed = forceExpanded ? false : collapsed;

        return (
            <aside className="flex h-full w-full flex-col bg-primary">
                <div
                    className={cx(
                        "flex items-center border-b border-secondary py-4",
                        isCollapsed ? "flex-col justify-center gap-2 px-2" : "justify-between gap-2 px-4",
                    )}
                >
                    {isCollapsed ? (
                        <Link
                            href="/learn"
                            className="font-logo text-sm font-extrabold text-primary"
                            title="de_study.ai"
                            onClick={() => setMobileNavOpen(false)}
                        >
                            ds
                        </Link>
                    ) : (
                        <div className="min-w-0 flex-1">
                            <Link
                                href="/learn"
                                className="font-logo text-lg font-extrabold tracking-tight text-primary"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                de_study.ai
                            </Link>
                            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-tertiary">Learning workspace</p>
                        </div>
                    )}

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

                <nav className={cx("flex flex-1 flex-col gap-0.5 py-4", isCollapsed ? "px-2" : "px-3")}>
                    {NAV_ITEMS.map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            item={item}
                            collapsed={isCollapsed}
                            current={item.isActive?.(pathname) ?? false}
                            onNavigate={() => setMobileNavOpen(false)}
                        />
                    ))}
                </nav>

                <div className={cx("border-t border-secondary p-3", isCollapsed && "flex flex-col items-center gap-2")}>
                    {isCollapsed ? (
                        <Tooltip title={displayName} placement="right">
                            <div className="py-2">
                                <Avatar size="sm" initials={initials} alt={displayName} />
                            </div>
                        </Tooltip>
                    ) : (
                        <div className="mb-3 flex items-center gap-3 px-1 py-2">
                            <Avatar size="sm" initials={initials} alt={displayName} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-primary">{displayName}</p>
                                <p className="truncate text-xs text-tertiary">{user?.email}</p>
                            </div>
                        </div>
                    )}

                    {isCollapsed ? (
                        <Tooltip title="Sign out" placement="right">
                            <Button
                                color="tertiary"
                                size="sm"
                                className="w-full"
                                aria-label="Sign out"
                                iconLeading={LogOut01}
                                onClick={() => {
                                    logout();
                                    router.push("/login");
                                }}
                            />
                        </Tooltip>
                    ) : (
                        <Button
                            color="tertiary"
                            size="sm"
                            className="w-full"
                            iconLeading={LogOut01}
                            onClick={() => {
                                logout();
                                router.push("/login");
                            }}
                        >
                            Sign out
                        </Button>
                    )}
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
