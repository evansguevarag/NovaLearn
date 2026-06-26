import { notFound } from "next/navigation";

import { ManagedEvaluationQuestionsClient } from "@/features/evaluations/components/managed-evaluation-questions-client";

interface AdminEvaluationQuestionsPageProps {
  params: Promise<{
    evaluationId: string;
  }>;
}

export default async function AdminEvaluationQuestionsPage({
  params,
}: AdminEvaluationQuestionsPageProps) {
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
      context="ADMIN"
    />
  );
}