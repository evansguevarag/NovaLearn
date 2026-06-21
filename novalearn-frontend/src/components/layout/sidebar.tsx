"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    Shield,
    } from "lucide-react";

    import { getAuthUser } from "@/lib/auth-storage";
    import { LogoutButton } from "@/components/shared/logout-button";
    import { Avatar, AvatarFallback } from "@/components/ui/avatar";
    import { Separator } from "@/components/ui/separator";

    export function Sidebar() {
    const pathname = usePathname();

    const user = getAuthUser();
    const role = user?.role;

    const displayName =
    user?.email?.split("@")[0] ?? "Usuario";

    const initials =
    displayName.substring(0, 2).toUpperCase();

    function getLinkClass(isActive: boolean) {
        return `
        flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
        ${isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"}
        `;
    }

    return (
        <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background sticky top-0">
        <div className="px-6 py-6">
            <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />

            <div>
                <p className="font-semibold">NovaLearn</p>

                <p className="text-xs text-muted-foreground">
                Learning Platform
                </p>
            </div>
            </div>
        </div>

        <Separator />

        <nav className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            General
            </p>

            {role === "ADMIN" && (
            <div className="space-y-1">
                <Link
                href="/admin/dashboard"
                className={getLinkClass(
                    pathname === "/admin/dashboard"
                )}
                >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
                </Link>

                <Link
                href="/admin/users"
                className={getLinkClass(
                    pathname === "/admin/users"
                )}
                >
                <Users className="h-4 w-4" />
                Usuarios
                </Link>
            </div>
            )}

            {role === "INSTRUCTOR" && (
            <Link
                href="/instructor/dashboard"
                className={getLinkClass(
                pathname === "/instructor/dashboard"
                )}
            >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
            )}

            {role === "STUDENT" && (
            <Link
                href="/student/dashboard"
                className={getLinkClass(
                pathname === "/student/dashboard"
                )}
            >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
            </Link>
            )}
        </nav>

        <Separator />

        <div className="p-4">
            <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                    {displayName}
                </p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                {role}
                </div>
            </div>
            </div>

            <LogoutButton />
        </div>
        </aside>
    );
}