import { api } from "@/lib/api";

import { getAdminCourseById } from "@/features/admin-courses/services/admin-course.service";
import { getInstructorCourseById } from "@/features/instructor-courses/services/instructor-course.service";

import type {
  InstructorCourseModule,
  InstructorCourseModuleRequest,
  InstructorLesson,
  InstructorLessonRequest,
} from "@/features/instructor-content/types/instructor-content.types";

export type CourseContentContext =
  | "ADMIN"
  | "INSTRUCTOR";

export interface CourseContentSummary {
  id: number;
  title: string;
}

export async function getManagedCourseById(
  context: CourseContentContext,
  courseId: number
): Promise<CourseContentSummary> {
  if (context === "ADMIN") {
    const course =
      await getAdminCourseById(courseId);

    return {
      id: course.id,
      title: course.title,
    };
  }

  const course =
    await getInstructorCourseById(courseId);

  return {
    id: course.id,
    title: course.title,
  };
}

export async function getManagedCourseModules(
  context: CourseContentContext,
  courseId: number
): Promise<InstructorCourseModule[]> {
  const response = await api.get<
    InstructorCourseModule[]
  >(
    `${getModuleBasePath(
      context
    )}/course/${courseId}`
  );

  return response.data;
}

export async function createManagedCourseModule(
  context: CourseContentContext,
  request: InstructorCourseModuleRequest
): Promise<InstructorCourseModule> {
  const response =
    await api.post<InstructorCourseModule>(
      getModuleBasePath(context),
      request
    );

  return response.data;
}

export async function updateManagedCourseModule(
  context: CourseContentContext,
  moduleId: number,
  request: InstructorCourseModuleRequest
): Promise<InstructorCourseModule> {
  const response =
    await api.put<InstructorCourseModule>(
      `${getModuleBasePath(
        context
      )}/${moduleId}`,
      request
    );

  return response.data;
}

export async function deleteManagedCourseModule(
  context: CourseContentContext,
  moduleId: number
): Promise<void> {
  await api.delete(
    `${getModuleBasePath(
      context
    )}/${moduleId}`
  );
}

export async function getManagedLessonsByModule(
  context: CourseContentContext,
  moduleId: number
): Promise<InstructorLesson[]> {
  const response = await api.get<
    InstructorLesson[]
  >(
    `${getLessonBasePath(
      context
    )}/module/${moduleId}`
  );

  return response.data;
}

export async function createManagedLesson(
  context: CourseContentContext,
  request: InstructorLessonRequest
): Promise<InstructorLesson> {
  const response =
    await api.post<InstructorLesson>(
      getLessonBasePath(context),
      request
    );

  return response.data;
}

export async function updateManagedLesson(
  context: CourseContentContext,
  lessonId: number,
  request: InstructorLessonRequest
): Promise<InstructorLesson> {
  const response =
    await api.put<InstructorLesson>(
      `${getLessonBasePath(
        context
      )}/${lessonId}`,
      request
    );

  return response.data;
}

export async function deleteManagedLesson(
  context: CourseContentContext,
  lessonId: number
): Promise<void> {
  await api.delete(
    `${getLessonBasePath(
      context
    )}/${lessonId}`
  );
}

export async function uploadManagedLessonResource(
  context: CourseContentContext,
  lessonId: number,
  file: File
): Promise<InstructorLesson> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<InstructorLesson>(
      `${getLessonBasePath(
        context
      )}/${lessonId}/resource`,
      formData
    );

  return response.data;
}

export async function deleteManagedLessonResource(
  context: CourseContentContext,
  lessonId: number
): Promise<InstructorLesson> {
  const response =
    await api.delete<InstructorLesson>(
      `${getLessonBasePath(
        context
      )}/${lessonId}/resource`
    );

  return response.data;
}

function getModuleBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/course-modules"
    : "/instructor/course-modules";
}

function getLessonBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/lessons"
    : "/instructor/lessons";
}