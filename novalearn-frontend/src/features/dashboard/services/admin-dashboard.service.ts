import { api } from "@/lib/api";
import type {
    AdminDashboardSummary,
    LatestEnrollment,
    LatestStudent,
    RevenueByMonth,
    TopCourse,
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

    export async function getLatestEnrollments(): Promise<LatestEnrollment[]> {
    const response = await api.get<LatestEnrollment[]>(
        "/admin/dashboard/latest-enrollments"
    );
    return response.data;
    }

    export async function getTopCourses(): Promise<TopCourse[]> {
    const response = await api.get<TopCourse[]>("/admin/dashboard/top-courses");
    return response.data;
    }

    export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
    const response = await api.get<RevenueByMonth[]>("/admin/dashboard/revenue");
    return response.data;
}