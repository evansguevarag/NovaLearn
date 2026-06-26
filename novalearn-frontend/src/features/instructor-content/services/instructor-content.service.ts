import { api } from "@/lib/api";

import type {
  InstructorCourseModule,
  InstructorCourseModuleRequest,
  InstructorLesson,
  InstructorLessonRequest,
} from "@/features/instructor-content/types/instructor-content.types";

export async function getInstructorCourseModules(
  courseId: number
): Promise<InstructorCourseModule[]> {
  const response = await api.get<
    InstructorCourseModule[]
  >(
    `/instructor/course-modules/course/${courseId}`
  );

  return response.data;
}

export async function getInstructorCourseModuleById(
  moduleId: number
): Promise<InstructorCourseModule> {
  const response =
    await api.get<InstructorCourseModule>(
      `/instructor/course-modules/${moduleId}`
    );

  return response.data;
}

export async function createInstructorCourseModule(
  request: InstructorCourseModuleRequest
): Promise<InstructorCourseModule> {
  const response =
    await api.post<InstructorCourseModule>(
      "/instructor/course-modules",
      request
    );

  return response.data;
}

export async function updateInstructorCourseModule(
  moduleId: number,
  request: InstructorCourseModuleRequest
): Promise<InstructorCourseModule> {
  const response =
    await api.put<InstructorCourseModule>(
      `/instructor/course-modules/${moduleId}`,
      request
    );

  return response.data;
}

export async function deleteInstructorCourseModule(
  moduleId: number
): Promise<void> {
  await api.delete(
    `/instructor/course-modules/${moduleId}`
  );
}

export async function getInstructorLessonsByModule(
  moduleId: number
): Promise<InstructorLesson[]> {
  const response = await api.get<
    InstructorLesson[]
  >(
    `/instructor/lessons/module/${moduleId}`
  );

  return response.data;
}

export async function getInstructorLessonById(
  lessonId: number
): Promise<InstructorLesson> {
  const response = await api.get<InstructorLesson>(
    `/instructor/lessons/${lessonId}`
  );

  return response.data;
}

export async function createInstructorLesson(
  request: InstructorLessonRequest
): Promise<InstructorLesson> {
  const response = await api.post<InstructorLesson>(
    "/instructor/lessons",
    request
  );

  return response.data;
}

export async function updateInstructorLesson(
  lessonId: number,
  request: InstructorLessonRequest
): Promise<InstructorLesson> {
  const response = await api.put<InstructorLesson>(
    `/instructor/lessons/${lessonId}`,
    request
  );

  return response.data;
}

export async function deleteInstructorLesson(
  lessonId: number
): Promise<void> {
  await api.delete(
    `/instructor/lessons/${lessonId}`
  );
}