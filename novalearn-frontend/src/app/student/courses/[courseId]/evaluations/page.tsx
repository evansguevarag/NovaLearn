import { notFound } from "next/navigation";

import { StudentCourseEvaluationsClient } from "@/features/student-learning/components/student-course-evaluations-client";

interface StudentCourseEvaluationsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentCourseEvaluationsPage({
  params,
}: StudentCourseEvaluationsPageProps) {
  const {
    courseId: courseIdParam,
  } = await params;

  const courseId = Number(courseIdParam);

  if (
    !Number.isInteger(courseId) ||
    courseId <= 0
  ) {
    notFound();
  }

  return (
    <StudentCourseEvaluationsClient
      courseId={courseId}
    />
  );
}