import { api } from "@/lib/api";
import type {
    AdminDashboardSummary,
    LatestStudent,
    } from "../types/admin-dashboard.types";

    export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await api.get<AdminDashboardSummary>("/admin/dashboard");
    return response.data;
    }

    export async function getLatestStudents(): Promise<LatestStudent[]> {
    const response = await api.get<LatestStudent[]>(
        "/admin/dashboard/latest-students"
    );
    return response.data;
}