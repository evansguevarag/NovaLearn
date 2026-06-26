import { api } from "@/lib/api";

import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";
import type {
  Evaluation,
  EvaluationRequest,
} from "@/features/evaluations/types/evaluation.types";

function getBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/evaluations"
    : "/instructor/evaluations";
}

export async function getManagedEvaluations(
  context: CourseContentContext,
  courseId: number
): Promise<Evaluation[]> {
  const response = await api.get<Evaluation[]>(
    `${getBasePath(context)}/course/${courseId}`
  );

  return response.data;
}

export async function createManagedEvaluation(
  context: CourseContentContext,
  request: EvaluationRequest
): Promise<Evaluation> {
  const response = await api.post<Evaluation>(
    getBasePath(context),
    request
  );

  return response.data;
}

export async function updateManagedEvaluation(
  context: CourseContentContext,
  evaluationId: number,
  request: EvaluationRequest
): Promise<Evaluation> {
  const response = await api.put<Evaluation>(
    `${getBasePath(context)}/${evaluationId}`,
    request
  );

  return response.data;
}

export async function deleteManagedEvaluation(
  context: CourseContentContext,
  evaluationId: number
): Promise<void> {
  await api.delete(
    `${getBasePath(context)}/${evaluationId}`
  );
}