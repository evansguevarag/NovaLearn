import { notFound } from "next/navigation";

import { ManagedEvaluationQuestionsClient } from "@/features/evaluations/components/managed-evaluation-questions-client";

interface InstructorEvaluationQuestionsPageProps {
  params: Promise<{
    evaluationId: string;
  }>;
}

export default async function InstructorEvaluationQuestionsPage({
  params,
}: InstructorEvaluationQuestionsPageProps) {
  const { evaluationId: value } =
    await params;

  const evaluationId = Number(value);

  if (
    !Number.isInteger(evaluationId) ||
    evaluationId <= 0
  ) {
    notFound();
  }

  return (
    <ManagedEvaluationQuestionsClient
      evaluationId={evaluationId}
      context="INSTRUCTOR"
    />
  );
}