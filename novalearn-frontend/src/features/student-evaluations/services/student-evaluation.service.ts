import { api } from "@/lib/api";

import type {
  Evaluation,
} from "@/features/evaluations/types/evaluation.types";

export async function getStudentCourseEvaluations(
  courseId: number
): Promise<Evaluation[]> {
  const response = await api.get<Evaluation[]>(
    `/student/evaluations/course/${courseId}`
  );

  return response.data;
}

export interface StudentEvaluationOverview {
  id: number;
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  title: string;
  description: string | null;
  evaluationType: string;
  deliveryMode: string;
  availableFrom: string | null;
  dueAt: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  maxScore: number;
  passingScore: number | null;
  latestAttemptId: number | null;
  latestAttemptStatus: string | null;
  latestAttemptNumber: number | null;
  latestAttemptStartedAt: string | null;
  latestAttemptSubmittedAt: string | null;
  latestAttemptScore: number | null;
  latestAttemptPassed: boolean | null;
  attemptsUsed: number;
}

export async function getStudentEvaluations(): Promise<
  StudentEvaluationOverview[]
> {
  const response = await api.get<StudentEvaluationOverview[]>(
    "/student/evaluations"
  );

  return response.data;
}

export async function getStudentEvaluation(
  evaluationId: number
): Promise<Evaluation> {
  const response = await api.get<Evaluation>(
    `/student/evaluations/${evaluationId}`
  );

  return response.data;
}
