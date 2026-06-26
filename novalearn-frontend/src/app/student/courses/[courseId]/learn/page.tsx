import { notFound } from "next/navigation";

import { StudentLearningClassroom } from "@/features/student-learning/components/student-learning-classroom";

interface StudentLearningPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentLearningPage({
  params,
}: StudentLearningPageProps) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    notFound();
  }

  return (
    <StudentLearningClassroom
      courseId={parsedCourseId}
    />
  );
}