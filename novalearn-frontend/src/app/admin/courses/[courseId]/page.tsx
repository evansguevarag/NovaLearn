import { notFound } from "next/navigation";

import { EditCourseClient } from "@/features/admin-courses/components/edit-course-client";

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    notFound();
  }

  return <EditCourseClient courseId={parsedCourseId} />;
}