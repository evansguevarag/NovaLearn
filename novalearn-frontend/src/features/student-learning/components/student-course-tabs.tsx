"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  ClipboardCheck,

  LayoutDashboard,
} from "lucide-react";

interface StudentCourseTabsProps {
  courseId: number;
}

interface CourseTab {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  exact?: boolean;
}

export function StudentCourseTabs({
  courseId,
}: StudentCourseTabsProps) {
  const pathname = usePathname();

  const basePath =
    `/student/courses/${courseId}`;

  const tabs: CourseTab[] = [
    {
      label: "Resumen",
      href: basePath,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Contenido",
      href: `${basePath}/learn`,
      icon: BookOpen,
    },
    {
      label: "Evaluaciones",
      href: `${basePath}/evaluations`,
      icon: ClipboardCheck,
    },

    {
      label: "Anuncios",
      href: `${basePath}/announcements`,
      icon: Bell,
    },
  ];

  function isActive(tab: CourseTab): boolean {
    if (tab.exact) {
      return pathname === tab.href;
    }

    return pathname.startsWith(tab.href);
  }

  return (
    <nav
      aria-label="Navegación interna del curso"
      className="border-b bg-background"
    >
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={
                  active ? "page" : undefined
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