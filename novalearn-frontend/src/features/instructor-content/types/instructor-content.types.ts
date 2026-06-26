export type LessonType =
  | "VIDEO"
  | "TEXT"
  | "RESOURCE"
  | "QUIZ";

export interface InstructorCourseModule {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorCourseModuleRequest {
  courseId: number;
  title: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

export interface InstructorLesson {
  id: number;
  moduleId: number;
  moduleTitle: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  resourceUrl: string | null;
  resourceFileName: string | null;
  resourceFileSize: number | null;
  lessonType: LessonType;
  durationMinutes: number;
  sortOrder: number;
  preview: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorLessonRequest {
  moduleId: number;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  lessonType: LessonType;
  durationMinutes: number;
  sortOrder: number;
  preview: boolean;
  active: boolean;
}

export interface InstructorModuleWithLessons
  extends InstructorCourseModule {
  lessons: InstructorLesson[];
  isLoadingLessons: boolean;
  lessonsError: string | null;
}

export interface QuizSettingDraft {
  id?: number;
  lessonId?: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  showCorrectAnswers: boolean;
}

export interface QuizOptionDraft {
  id?: number;
  clientId: string;
  optionText: string;
  correct: boolean;
  sortOrder: number;
}

export interface QuizQuestionDraft {
  id?: number;
  lessonId?: number;
  clientId: string;
  questionText: string;
  points: number;
  explanation: string;
  sortOrder: number;
  active: boolean;
  options: QuizOptionDraft[];
}

export interface QuizDraft {
  settings: QuizSettingDraft;
  questions: QuizQuestionDraft[];
}

export interface LessonFormSubmission {
  lesson: InstructorLessonRequest;
  resourceFile: File | null;
  quiz: QuizDraft | null;
}