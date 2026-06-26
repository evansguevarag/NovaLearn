import { api } from "@/lib/api";

import type {
  StudentQuiz,
  StudentQuizAttempt,
  StudentQuizResult,
  StudentQuizSubmissionRequest,
} from "@/features/student-quiz/types/student-quiz.types";

export async function startStudentQuizAttempt(
  lessonId: number
): Promise<StudentQuiz> {
  const response = await api.post<StudentQuiz>(
    `/student/quiz/lessons/${lessonId}/attempts/start`
  );

  return response.data;
}

export async function submitStudentQuizAttempt(
  lessonId: number,
  request: StudentQuizSubmissionRequest
): Promise<StudentQuizResult> {
  const response = await api.post<StudentQuizResult>(
    `/student/quiz/lessons/${lessonId}/attempts/submit`,
    request
  );

  return response.data;
}

export async function getStudentQuizAttempts(
  lessonId: number
): Promise<StudentQuizAttempt[]> {
  const response = await api.get<StudentQuizAttempt[]>(
    `/student/quiz/lessons/${lessonId}/attempts`
  );

  return response.data;
}

export async function getStudentQuizAttemptResult(
  attemptId: number
): Promise<StudentQuizResult> {
  const response = await api.get<StudentQuizResult>(
    `/student/quiz/attempts/${attemptId}/result`
  );

  return response.data;
}