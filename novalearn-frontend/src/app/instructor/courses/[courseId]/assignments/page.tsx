import { notFound } from "next/navigation";

import { ManagedCourseAssignmentsClient } from "@/features/assignments/components/managed-course-assignments-client";

interface InstructorCourseAssignmentsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function InstructorCourseAssignmentsPage({
  params,
}: InstructorCourseAssignmentsPageProps) {
  const {
    courseId: courseIdParam,
  } = await params;

  const courseId = Number(
    courseIdParam
  );

  if (
    !Number.isInteger(courseId) ||
    courseId <= 0
  ) {
    notFound();
  }

  return (
    <ManagedCourseAssignmentsClient
      courseId={courseId}
      context="INSTRUCTOR"
    />
  );
}