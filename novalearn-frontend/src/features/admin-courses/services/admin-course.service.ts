import { api } from "@/lib/api";

import type {
    AdminCourse,
    AdminCourseRequest,
    CourseCategory,
    CourseThumbnailUploadResponse,
    } from "@/features/admin-courses/types/admin-course.types";

    export async function getAdminCourses(): Promise<AdminCourse[]> {
    const response = await api.get<AdminCourse[]>("/admin/courses");
    return response.data;
    }

    export async function getAdminCourseById(
    courseId: number
    ): Promise<AdminCourse> {
    const response = await api.get<AdminCourse>(
        `/admin/courses/${courseId}`
    );

    return response.data;
    }

    export async function createAdminCourse(
    request: AdminCourseRequest
    ): Promise<AdminCourse> {
    const response = await api.post<AdminCourse>(
        "/admin/courses",
        request
    );

    return response.data;
    }

    export async function updateAdminCourse(
    courseId: number,
    request: AdminCourseRequest
    ): Promise<AdminCourse> {
    const response = await api.put<AdminCourse>(
        `/admin/courses/${courseId}`,
        request
    );

    return response.data;
    }

    export async function deleteAdminCourse(
    courseId: number
    ): Promise<void> {
    await api.delete(`/admin/courses/${courseId}`);
    }

    export async function getCourseCategories(): Promise<
    CourseCategory[]
    > {
    const response = await api.get<CourseCategory[]>(
        "/admin/course-categories"
    );

    return response.data;
    }
    export async function uploadCourseThumbnail(
    courseId: number,
    file: File
    ): Promise<CourseThumbnailUploadResponse> {
    const formData = new FormData();

    formData.append("file", file);

    const response =
        await api.post<CourseThumbnailUploadResponse>(
        `/admin/courses/${courseId}/thumbnail`,
        formData
        );

    return response.data;
    }