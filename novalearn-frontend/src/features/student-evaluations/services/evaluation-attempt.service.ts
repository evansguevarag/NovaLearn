import { api } from "@/lib/api";

import type {
  EvaluationAttemptDetail,
  EvaluationAttemptSaveRequest,
  EvaluationAttemptSummary,
} from "@/features/student-evaluations/types/evaluation-attempt.types";

export async function startEvaluationAttempt(
  evaluationId: number
): Promise<EvaluationAttemptDetail> {
  const response =
    await api.post<EvaluationAttemptDetail>(
      `/student/evaluations/${evaluationId}/attempts/start`
    );

  return response.data;
}

export async function getEvaluationAttempt(
  attemptId: number
): Promise<EvaluationAttemptDetail> {
  const response =
    await api.get<EvaluationAttemptDetail>(
      `/student/evaluations/attempts/${attemptId}`
    );

  return response.data;
}

export async function saveEvaluationAttemptAnswers(
  attemptId: number,
  request: EvaluationAttemptSaveRequest
): Promise<EvaluationAttemptDetail> {
  const response =
    await api.put<EvaluationAttemptDetail>(
      `/student/evaluations/attempts/${attemptId}/answers`,
      request
    );

  return response.data;
}

export async function submitEvaluationAttempt(
  attemptId: number
): Promise<EvaluationAttemptDetail> {
  const response =
    await api.post<EvaluationAttemptDetail>(
      `/student/evaluations/attempts/${attemptId}/submit`
    );

  return response.data;
}

export async function getEvaluationAttemptHistory(
  evaluationId: number
): Promise<EvaluationAttemptSummary[]> {
  const response =
    await api.get<EvaluationAttemptSummary[]>(
      `/student/evaluations/${evaluationId}/attempts`
    );

  return response.data;
}