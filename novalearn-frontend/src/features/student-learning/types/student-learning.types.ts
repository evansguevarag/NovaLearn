export type StudentLessonType =
  | "VIDEO"
  | "TEXT"
  | "RESOURCE"
  | "QUIZ";

export interface StudentLearningLesson {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  lessonType: StudentLessonType;
  durationMinutes: number;
  sortOrder: number;
  preview: boolean;
  completed: boolean;

  resourceFileId: number | null;
  resourceUrl: string | null;
  resourceFileName: string | null;
  resourceMimeType: string | null;
  resourceFileSize: number | null;
}

export interface StudentLearningModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: StudentLearningLesson[];
}

export interface StudentLearningCourse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  categoryName: string;
  instructorName: string;
  level: string | null;
  certificateEnabled: boolean;

  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;

  totalModules: number;
  totalLessons: number;
  completedLessons: number;

  modules: StudentLearningModule[];
}