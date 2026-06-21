import { api } from "@/lib/api";

import type {
    InstructorCourse,
    InstructorDashboardSummary,
    InstructorEnrollment,
    } from "@/features/instructor-dashboard/types/instructor-dashboard.types";

    export async function getInstructorDashboard(): Promise<InstructorDashboardSummary> {
    const response = await api.get<InstructorDashboardSummary>(
        "/instructor/dashboard"
    );

    return response.data;
    }

    export async function getInstructorCourses(): Promise<InstructorCourse[]> {
    const response = await api.get<InstructorCourse[]>(
        "/instructor/dashboard/my-courses"
    );

    return response.data;
    }

    export async function getInstructorEnrollments(): Promise<
    InstructorEnrollment[]
    > {
    const response = await api.get<InstructorEnrollment[]>(
        "/instructor/dashboard/my-enrollments"
    );

    return response.data;
}