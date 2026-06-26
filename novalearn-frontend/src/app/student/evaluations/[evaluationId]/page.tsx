import { notFound } from "next/navigation";

import { StudentEvaluationDetail } from "@/features/student-evaluations/components/student-evaluation-detail";

interface StudentEvaluationPageProps {
  params: Promise<{
    evaluationId: string;
  }>;
}

export default async function StudentEvaluationPage({
  params,
}: StudentEvaluationPageProps) {
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
    <StudentEvaluationDetail
      evaluationId={evaluationId}
    />
  );
}