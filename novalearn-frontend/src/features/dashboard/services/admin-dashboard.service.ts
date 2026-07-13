import { api } from "@/lib/api";
import type {
    AdminDashboardSummary,
    LatestEnrollment,
    LatestStudent,
    RevenuePayment,
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

    export async function getRevenue(): Promise<RevenuePayment[]> {
    const response = await api.get<RevenuePayment[]>("/admin/dashboard/revenue");
    return response.data;
}
