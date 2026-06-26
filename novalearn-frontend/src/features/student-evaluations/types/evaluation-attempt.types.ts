export type EvaluationAttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "GRADED";

export type EvaluationAttemptQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export interface EvaluationAttemptOption {
  id: number;
  optionText: string;
  sortOrder: number;
  correct: boolean | null;
}

export interface EvaluationAttemptQuestion {
  id: number;
  questionType: EvaluationAttemptQuestionType;
  prompt: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  required: boolean;
  options: EvaluationAttemptOption[];
  textAnswer: string | null;
  selectedOptionIds: number[];
  correct: boolean | null;
  pointsEarned: number | null;
}

export interface EvaluationAttemptDetail {
  id: number;
  evaluationId: number;
  courseId: number;
  evaluationTitle: string;
  attemptNumber: number;
  status: EvaluationAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string | null;
  timeLimitMinutes: number | null;
  maxScore: number;
  passingScore: number | null;
  score: number | null;
  passed: boolean | null;
  showResults: boolean;
  showCorrectAnswers: boolean;
  questions: EvaluationAttemptQuestion[];
}

export interface EvaluationAttemptSummary {
  id: number;
  evaluationId: number;
  attemptNumber: number;
  status: EvaluationAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  passed: boolean | null;
}

export interface EvaluationAttemptAnswerRequest {
  questionId: number;
  textAnswer: string | null;
  selectedOptionIds: number[];
}

export interface EvaluationAttemptSaveRequest {
  answers: EvaluationAttemptAnswerRequest[];
}