"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart01,
    BookOpen01,
    Home01,
    LogOut01,
    Menu01,
    SearchLg,
    Settings01,
    X,
} from "@untitledui/icons";
import { useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { useAuth } from "@/providers/auth-provider";
import { cx } from "@/utils/cx";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/learn", icon: Home01 },
    { label: "My courses", href: "/learn", icon: BookOpen01 },
    { label: "Progress", href: "/learn", icon: BarChart01 },
    { label: "Settings", href: "/learn", icon: Settings01 },
] as const;

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

    const displayName = user?.display_name || user?.username || "Learner";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const sidebar = (
        <aside className="flex h-full w-full flex-col bg-primary">
            <div className="border-b border-secondary px-5 py-4">
                <Link href="/" className="font-logo text-lg font-extrabold tracking-tight text-primary">
                    de_cooper.ai
                </Link>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-tertiary">Learning workspace</p>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const isCurrent =
                        item.label === "Dashboard"
                            ? pathname === "/learn"
                            : item.label === "My courses"
                              ? pathname.startsWith("/learn/") && pathname !== "/learn"
                              : false;
                    return (
                        <NavItemBase
                            key={item.label}
                            type="link"
                            href={item.href}
                            icon={item.icon}
                            current={isCurrent}
                        >
                            {item.label}
                        </NavItemBase>
                    );
                })}
            </nav>

            <div className="border-t border-secondary p-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                    <Avatar size="sm" initials={initials} alt={displayName} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">{displayName}</p>
                        <p className="truncate text-xs text-tertiary">{user?.email}</p>
                    </div>
                </div>
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
            </div>
        </aside>
    );

    return (
        <div className="min-h-dvh bg-secondary">
            {/* Mobile overlay */}
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-overlay/60 lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* Sidebar — desktop fixed, mobile drawer */}
            <div
                className={cx(
                    "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-secondary transition-transform duration-200 ease-linear lg:translate-x-0",
                    mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
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
                {sidebar}
            </div>

            {/* Main column */}
            <div className="lg:pl-[280px]">
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
                            {title && <h1 className="truncate font-display text-lg font-semibold text-primary sm:text-xl">{title}</h1>}
                            {subtitle && <p className="truncate text-sm text-tertiary">{subtitle}</p>}
                        </div>

                        <div className="hidden max-w-sm flex-1 sm:block">
                            <Input size="sm" aria-label="Search courses" placeholder="Search topics..." icon={SearchLg} />
                        </div>

                        <Link href="/" className="hidden text-xs font-medium text-tertiary hover:text-secondary sm:block">
                            Back to site
                        </Link>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
