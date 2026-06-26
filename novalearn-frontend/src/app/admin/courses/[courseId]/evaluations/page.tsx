import { notFound } from "next/navigation";

import { ManagedCourseEvaluationsClient } from "@/features/evaluations/components/managed-course-evaluations-client";

interface AdminCourseEvaluationsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function AdminCourseEvaluationsPage({
  params,
}: AdminCourseEvaluationsPageProps) {
  const { courseId: value } =
    await params;

  const courseId = Number(value);

  if (
    !Number.isInteger(courseId) ||
    courseId <= 0
  ) {
    notFound();
  }

  return (
    <ManagedCourseEvaluationsClient
      courseId={courseId}
      context="ADMIN"
    />
  );
}