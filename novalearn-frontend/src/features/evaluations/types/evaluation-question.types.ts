export type EvaluationQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export interface EvaluationOption {
  id: number;
  optionText: string;
  correct: boolean;
  sortOrder: number;
}

export interface EvaluationQuestion {
  id: number;
  evaluationId: number;
  questionType: EvaluationQuestionType;
  prompt: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  required: boolean;
  options: EvaluationOption[];
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationOptionRequest {
  optionText: string;
  correct: boolean;
  sortOrder: number;
}

export interface EvaluationQuestionRequest {
  questionType: EvaluationQuestionType;
  prompt: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  required: boolean;
  options: EvaluationOptionRequest[];
}