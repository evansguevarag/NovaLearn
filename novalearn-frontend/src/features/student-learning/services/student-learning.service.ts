import { api } from "@/lib/api";

import type {
  StudentLearningCourse,
} from "@/features/student-learning/types/student-learning.types";

export async function getStudentLearningCourse(
  courseId: number
): Promise<StudentLearningCourse> {
  const response = await api.get<StudentLearningCourse>(
    `/student/learning/courses/${courseId}`
  );

  return response.data;
}