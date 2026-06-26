export type EvaluationStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED";

export type EvaluationType =
  | "QUIZ"
  | "PRACTICE"
  | "MIDTERM"
  | "FINAL_EXAM";

export type EvaluationDeliveryMode =
  | "ONLINE_QUIZ"
  | "TEXT_SUBMISSION"
  | "FILE_SUBMISSION"
  | "HYBRID";

export interface Evaluation {
  id: number;
  moduleId: number;
  moduleTitle: string;
  moduleSortOrder: number;
  courseId: number;
  courseTitle: string;
  createdById: number;
  title: string;
  description: string | null;
  instructions: string | null;
  evaluationType: EvaluationType;
  deliveryMode: EvaluationDeliveryMode;
  status: EvaluationStatus;
  availableFrom: string | null;
  dueAt: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  maxScore: number;
  passingScore: number | null;
  shuffleQuestions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowLateSubmission: boolean;
  maxFiles: number | null;
  maxFileSizeMb: number | null;
  allowedFileExtensions: string | null;
  visibleInContent: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRequest {
  moduleId: number;
  title: string;
  description: string | null;
  instructions: string | null;
  evaluationType: EvaluationType;
  deliveryMode: EvaluationDeliveryMode;
  status: EvaluationStatus;
  availableFrom: string | null;
  dueAt: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  maxScore: number;
  passingScore: number | null;
  shuffleQuestions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowLateSubmission: boolean;
  maxFiles: number | null;
  maxFileSizeMb: number | null;
  allowedFileExtensions: string | null;
  visibleInContent: boolean;
  sortOrder: number;
}