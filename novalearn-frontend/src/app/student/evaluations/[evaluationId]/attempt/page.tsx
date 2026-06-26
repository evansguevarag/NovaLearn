import { notFound } from "next/navigation";

import { EvaluationAttemptPlayer } from "@/features/student-evaluations/components/evaluation-attempt-player";

interface EvaluationAttemptPageProps {
  params: Promise<{
    evaluationId: string;
  }>;
}

export default async function EvaluationAttemptPage({
  params,
}: EvaluationAttemptPageProps) {
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
    <EvaluationAttemptPlayer
      evaluationId={evaluationId}
    />
  );
}