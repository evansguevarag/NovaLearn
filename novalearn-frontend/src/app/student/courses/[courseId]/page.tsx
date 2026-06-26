import { notFound } from "next/navigation";

import { StudentCourseOverviewClient } from "@/features/student-learning/components/student-course-overview-client";

interface StudentCourseOverviewPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentCourseOverviewPage({
  params,
}: StudentCourseOverviewPageProps) {
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
    <StudentCourseOverviewClient
      courseId={courseId}
    />
  );
}