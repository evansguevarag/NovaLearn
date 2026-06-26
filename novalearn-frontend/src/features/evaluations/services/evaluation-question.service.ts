import { api } from "@/lib/api";

import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";
import type {
  Evaluation,
} from "@/features/evaluations/types/evaluation.types";
import type {
  EvaluationQuestion,
  EvaluationQuestionRequest,
} from "@/features/evaluations/types/evaluation-question.types";

function getEvaluationBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/evaluations"
    : "/instructor/evaluations";
}

export async function getManagedEvaluation(
  context: CourseContentContext,
  evaluationId: number
): Promise<Evaluation> {
  const response = await api.get<Evaluation>(
    `${getEvaluationBasePath(context)}/${evaluationId}`
  );

  return response.data;
}

export async function getEvaluationQuestions(
  context: CourseContentContext,
  evaluationId: number
): Promise<EvaluationQuestion[]> {
  const response = await api.get<EvaluationQuestion[]>(
    `${getEvaluationBasePath(context)}/${evaluationId}/questions`
  );

  return response.data;
}

export async function createEvaluationQuestion(
  context: CourseContentContext,
  evaluationId: number,
  request: EvaluationQuestionRequest
): Promise<EvaluationQuestion> {
  const response = await api.post<EvaluationQuestion>(
    `${getEvaluationBasePath(context)}/${evaluationId}/questions`,
    request
  );

  return response.data;
}

export async function updateEvaluationQuestion(
  context: CourseContentContext,
  evaluationId: number,
  questionId: number,
  request: EvaluationQuestionRequest
): Promise<EvaluationQuestion> {
  const response = await api.put<EvaluationQuestion>(
    `${getEvaluationBasePath(context)}/${evaluationId}/questions/${questionId}`,
    request
  );

  return response.data;
}

export async function deleteEvaluationQuestion(
  context: CourseContentContext,
  evaluationId: number,
  questionId: number
): Promise<void> {
  await api.delete(
    `${getEvaluationBasePath(context)}/${evaluationId}/questions/${questionId}`
  );
}