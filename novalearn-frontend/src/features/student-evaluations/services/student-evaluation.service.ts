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

export async function getStudentEvaluation(
  evaluationId: number
): Promise<Evaluation> {
  const response = await api.get<Evaluation>(
    `/student/evaluations/${evaluationId}`
  );

  return response.data;
}