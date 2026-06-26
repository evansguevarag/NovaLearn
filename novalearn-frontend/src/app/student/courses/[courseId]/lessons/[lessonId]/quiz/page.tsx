import { notFound } from "next/navigation";

import { StudentQuizPageClient } from "@/features/student-quiz/components/student-quiz-page-client";

interface StudentQuizPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function StudentQuizPage({
  params,
}: StudentQuizPageProps) {
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
    <StudentQuizPageClient
      courseId={courseId}
      lessonId={lessonId}
    />
  );
}