import { api } from "@/lib/api";

import type {
  CourseThumbnailUploadResponse,
  InstructorCourse,
  InstructorCourseCategory,
  InstructorCourseRequest,
} from "@/features/instructor-courses/types/instructor-course.types";

export async function getInstructorCourses(): Promise<
  InstructorCourse[]
> {
  const response = await api.get<InstructorCourse[]>(
    "/instructor/courses"
  );

  return response.data;
}

export async function getInstructorCourseById(
  courseId: number
): Promise<InstructorCourse> {
  const response = await api.get<InstructorCourse>(
    `/instructor/courses/${courseId}`
  );

  return response.data;
}

export async function createInstructorCourse(
  request: InstructorCourseRequest
): Promise<InstructorCourse> {
  const response = await api.post<InstructorCourse>(
    "/instructor/courses",
    request
  );

  return response.data;
}

export async function updateInstructorCourse(
  courseId: number,
  request: InstructorCourseRequest
): Promise<InstructorCourse> {
  const response = await api.put<InstructorCourse>(
    `/instructor/courses/${courseId}`,
    request
  );

  return response.data;
}

export async function getInstructorCourseCategories(): Promise<
  InstructorCourseCategory[]
> {
  const response = await api.get<InstructorCourseCategory[]>(
    "/instructor/course-categories"
  );

  return response.data;
}

export async function uploadInstructorCourseThumbnail(
  courseId: number,
  file: File
): Promise<CourseThumbnailUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response =
    await api.post<CourseThumbnailUploadResponse>(
      `/instructor/courses/${courseId}/thumbnail`,
      formData
    );

  return response.data;
}
