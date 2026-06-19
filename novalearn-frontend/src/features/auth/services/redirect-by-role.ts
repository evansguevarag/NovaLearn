import type { UserRole } from "../types/auth.types";

export function getDashboardPathByRole(role: UserRole): string {
    if (role === "ADMIN") {
        return "/admin/dashboard";
    }

    if (role === "INSTRUCTOR") {
        return "/instructor/dashboard";
    }

    return "/student/dashboard";
}