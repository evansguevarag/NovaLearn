import { notFound } from "next/navigation";

import { ManagedCourseEvaluationsClient } from "@/features/evaluations/components/managed-course-evaluations-client";

interface InstructorCourseEvaluationsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function InstructorCourseEvaluationsPage({
  params,
}: InstructorCourseEvaluationsPageProps) {
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
      context="INSTRUCTOR"
    />
  );
}