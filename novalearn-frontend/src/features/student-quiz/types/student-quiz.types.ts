export interface StudentQuizOption {
  id: number;
  optionText: string;
  sortOrder: number;
}

export interface StudentQuizQuestion {
  id: number;
  questionText: string;
  points: number;
  sortOrder: number;
  options: StudentQuizOption[];
}

export interface StudentQuiz {
  lessonId: number;
  lessonTitle: string;
  attemptId: number;
  attemptNumber: number;
  passingScore: number;
  maxAttempts: number;
  remainingAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  totalQuestions: number;
  totalPoints: number;
  questions: StudentQuizQuestion[];
}

export interface StudentQuizAnswerRequest {
  questionId: number;
  selectedOptionId: number;
}

export interface StudentQuizSubmissionRequest {
  attemptId: number;
  answers: StudentQuizAnswerRequest[];
}

export interface StudentQuizAttemptAnswer {
  id: number;
  questionId: number | null;
  questionText: string | null;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correct: boolean;
  pointsEarned: number;
  questionPoints: number;
  answeredAt: string;
}

export interface StudentQuizAttempt {
  id: number;
  studentId: number | null;
  lessonId: number | null;
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completed: boolean;
  attemptedAt: string;
  startedAt: string;
  completedAt: string | null;
  answers: StudentQuizAttemptAnswer[];
}

export interface StudentQuizResultAnswer {
  questionId: number | null;
  questionText: string | null;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correct: boolean;
  pointsEarned: number;
  questionPoints: number;
  correctOptionId: number | null;
  correctOptionText: string | null;
  explanation: string | null;
}

export interface StudentQuizResult {
  attemptId: number;
  lessonId: number | null;
  attemptNumber: number;
  completed: boolean;
  showResult: boolean;
  showCorrectAnswers: boolean;
  score: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
  passed: boolean | null;
  completedAt: string | null;
  answers: StudentQuizResultAnswer[];
}