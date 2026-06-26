import { api } from "@/lib/api";

export interface LessonProgressRequest {
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
}

export interface LessonProgressResponse {
  id: number;
  enrollmentId: number;
  lessonId: number;
  lessonTitle: string;
  completed: boolean;
  completedAt: string | null;
}

export async function updateStudentLessonProgress(
  request: LessonProgressRequest
): Promise<LessonProgressResponse> {
  const response =
    await api.post<LessonProgressResponse>(
      "/student/progress",
      request
    );

  return response.data;
}

export async function markStudentLessonCompleted(
  enrollmentId: number,
  lessonId: number
): Promise<LessonProgressResponse> {
  return updateStudentLessonProgress({
    enrollmentId,
    lessonId,
    completed: true,
  });
}

export async function markStudentLessonPending(
  enrollmentId: number,
  lessonId: number
): Promise<LessonProgressResponse> {
  return updateStudentLessonProgress({
    enrollmentId,
    lessonId,
    completed: false,
  });
}