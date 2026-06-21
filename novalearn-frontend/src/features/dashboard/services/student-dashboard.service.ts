import { api } from "@/lib/api";
import type {
    StudentCertificate,
    StudentCourse,
    StudentDashboardSummary,
    StudentPayment,
    } from "../types/student-dashboard.types";

    export async function getStudentDashboardSummary(): Promise<StudentDashboardSummary> {
    const response = await api.get<StudentDashboardSummary>("/student/dashboard");
    return response.data;
    }

    export async function getStudentCourses(): Promise<StudentCourse[]> {
    const response = await api.get<StudentCourse[]>(
        "/student/dashboard/my-courses"
    );
    return response.data;
    }

    export async function getStudentCertificates(): Promise<StudentCertificate[]> {
    const response = await api.get<StudentCertificate[]>(
        "/student/dashboard/my-certificates"
    );
    return response.data;
    }

    export async function getStudentPayments(): Promise<StudentPayment[]> {
    const response = await api.get<StudentPayment[]>(
        "/student/dashboard/my-payments"
    );
    return response.data;
}