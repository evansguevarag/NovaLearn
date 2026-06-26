import { notFound } from "next/navigation";

import { EditInstructorCourseClient } from "@/features/instructor-courses/components/edit-instructor-course-client";

interface InstructorCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function InstructorCoursePage({
  params,
}: InstructorCoursePageProps) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    notFound();
  }

  return (
    <EditInstructorCourseClient
      courseId={parsedCourseId}
    />
  );
}