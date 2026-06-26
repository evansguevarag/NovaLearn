import { notFound } from "next/navigation";

import { CourseContentClient } from "@/features/instructor-content/components/course-content-client";

interface InstructorCourseContentPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function InstructorCourseContentPage({
  params,
}: InstructorCourseContentPageProps) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    notFound();
  }

  return (
    <CourseContentClient
      courseId={parsedCourseId}
      context="INSTRUCTOR"
    />
  );
}