import { notFound } from "next/navigation";

import { StudentLessonPageClient } from "@/features/student-learning/components/student-lesson-page-client";

interface StudentLessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function StudentLessonPage({
  params,
}: StudentLessonPageProps) {
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
    <StudentLessonPageClient
      courseId={courseId}
      lessonId={lessonId}
    />
  );
}