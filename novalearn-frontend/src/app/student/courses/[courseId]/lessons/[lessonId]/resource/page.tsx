import { notFound } from "next/navigation";

import { StudentResourcePageClient } from "@/features/student-resources/components/student-resource-page-client";

interface StudentResourcePageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function StudentResourcePage({
  params,
}: StudentResourcePageProps) {
  const {
    courseId: courseIdParam,
    lessonId: lessonIdParam,
  } = await params;

  const courseId = Number(courseIdParam);
  const lessonId = Number(lessonIdParam);

  if (
    !Number.isInteger(courseId) ||
    courseId <= 0 ||
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    notFound();
  }

  return (
    <StudentResourcePageClient
      courseId={courseId}
      lessonId={lessonId}
    />
  );
}