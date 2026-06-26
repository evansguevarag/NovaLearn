"use client";

import {
  BookOpen,
  Compass,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/shared/logout-button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getAuthUser } from "@/lib/auth-storage";

export function Sidebar() {
  const pathname = usePathname();

  const user = getAuthUser();
  const role = user?.role;

  const displayName =
    user?.email?.split("@")[0] ?? "Usuario";

  const initials = displayName
    .substring(0, 2)
    .toUpperCase();

  function getLinkClass(
    isActive: boolean
  ): string {
    return [
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted",
    ].join(" ");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6" />

          <div>
            <p className="font-semibold">
              NovaLearn
            </p>

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
                pathname.startsWith("/admin/users")
              )}
            >
              <Users className="h-4 w-4" />
              Usuarios
            </Link>

            <Link
              href="/admin/courses"
              className={getLinkClass(
                pathname.startsWith("/admin/courses")
              )}
            >
              <BookOpen className="h-4 w-4" />
              Cursos
            </Link>

            <Link
              href="/admin/categories"
              className={getLinkClass(
                pathname.startsWith(
                  "/admin/categories"
                )
              )}
            >
              <FolderOpen className="h-4 w-4" />
              Categorías
            </Link>
          </div>
        )}

        {role === "INSTRUCTOR" && (
            <div className="space-y-1">
              <Link
                href="/instructor/dashboard"
                className={getLinkClass(
                  pathname === "/instructor/dashboard"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/instructor/courses"
                className={getLinkClass(
                  pathname.startsWith("/instructor/courses")
                )}
              >
                <BookOpen className="h-4 w-4" />
                Mis cursos
              </Link>
            </div>
          )}

        {role === "STUDENT" && (
          <div className="space-y-1">
            <Link
              href="/student/dashboard"
              className={getLinkClass(
                pathname === "/student/dashboard"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/student/catalog"
              className={getLinkClass(
                pathname.startsWith(
                  "/student/catalog"
                )
              )}
            >
              <Compass className="h-4 w-4" />
              Catálogo
            </Link>

            <Link
              href="/student/courses"
              className={getLinkClass(
                pathname.startsWith(
                  "/student/courses"
                )
              )}
            >
              <BookOpen className="h-4 w-4" />
              Mis cursos
            </Link>
          </div>
        )}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          <Avatar>
            <AvatarFallback>
              {initials}
            </AvatarFallback>
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
