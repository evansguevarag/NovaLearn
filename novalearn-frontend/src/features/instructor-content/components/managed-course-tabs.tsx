"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type {
  ComponentType,
} from "react";
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";

interface ManagedCourseTabsProps {
  courseId: number;
  context: CourseContentContext;
}

interface ManagedCourseTab {
  label: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
  exact?: boolean;
}

export function ManagedCourseTabs({
  courseId,
  context,
}: ManagedCourseTabsProps) {
  const pathname = usePathname();

  const rolePath =
    context === "ADMIN"
      ? "admin"
      : "instructor";

  const basePath =
    `/${rolePath}/courses/${courseId}`;

  const tabs: ManagedCourseTab[] = [
    {
      label: "Resumen",
      href: basePath,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Contenido",
      href: `${basePath}/content`,
      icon: BookOpen,
    },
    {
      label: "Evaluaciones",
      href: `${basePath}/evaluations`,
      icon: ClipboardCheck,
    },
    {
      label: "Tareas",
      href: `${basePath}/assignments`,
      icon: ClipboardList,
    },
  ];

  function isActive(
    tab: ManagedCourseTab
  ): boolean {
    if (tab.exact) {
      return pathname === tab.href;
    }

    return pathname.startsWith(
      tab.href
    );
  }

  return (
    <nav
      aria-label="Navegación de administración del curso"
      className="border-b bg-background"
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={[
                  "relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />

                <span>
                  {tab.label}
                </span>

                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}