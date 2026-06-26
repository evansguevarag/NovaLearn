import { api } from "@/lib/api";

import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";

import type {
  QuizDraft,
  QuizOptionDraft,
  QuizQuestionDraft,
  QuizSettingDraft,
} from "@/features/instructor-content/types/instructor-content.types";

export interface QuizSettingResponse {
  id: number;
  lessonId: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  showCorrectAnswers: boolean;
}

export interface QuizOptionResponse {
  id: number;
  optionText: string;
  correct: boolean;
  sortOrder: number;
}

export interface QuizQuestionResponse {
  id: number;
  lessonId: number;
  questionText: string;
  points: number;
  explanation: string | null;
  sortOrder: number;
  active: boolean;
  options: QuizOptionResponse[];
}

interface QuizDetailResponse {
  lessonId?: number;
  setting?: QuizSettingResponse | null;
  settings?: QuizSettingResponse | null;
  questions: QuizQuestionResponse[];
}

interface QuizSettingRequest {
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  showCorrectAnswers: boolean;
}

interface QuizOptionRequest {
  optionText: string;
  correct: boolean;
  sortOrder: number;
}

interface QuizQuestionRequest {
  questionText: string;
  points: number;
  explanation: string | null;
  sortOrder: number;
  active: boolean;
  options: QuizOptionRequest[];
}

export async function getManagedQuizDraft(
  context: CourseContentContext,
  lessonId: number
): Promise<QuizDraft> {
  const response =
    await api.get<QuizDetailResponse>(
      `${getQuizBasePath(
        context
      )}/lessons/${lessonId}`
    );

  const detail = response.data;

  const setting =
    detail.setting ??
    detail.settings ??
    null;

  return {
    settings: setting
      ? mapSettingDraft(setting)
      : createDefaultSettings(),
    questions: (detail.questions ?? [])
      .slice()
      .sort(
        (first, second) =>
          first.sortOrder -
          second.sortOrder
      )
      .map(mapQuestionDraft),
  };
}

export async function saveManagedQuizDraft(
  context: CourseContentContext,
  lessonId: number,
  quizDraft: QuizDraft
): Promise<void> {
  await saveManagedQuizSettings(
    context,
    lessonId,
    quizDraft.settings
  );

  const currentQuiz =
    await getManagedQuizDraft(
      context,
      lessonId
    );

  const retainedQuestionIds =
    new Set(
      quizDraft.questions
        .map((question) => question.id)
        .filter(
          (questionId): questionId is number =>
            typeof questionId === "number"
        )
    );

  const questionsToDelete =
    currentQuiz.questions.filter(
      (question) =>
        typeof question.id === "number" &&
        !retainedQuestionIds.has(
          question.id
        )
    );

  for (
    const question of questionsToDelete
  ) {
    await deleteManagedQuizQuestion(
      context,
      lessonId,
      question.id!
    );
  }

  for (
    const question of quizDraft.questions
  ) {
    if (typeof question.id === "number") {
      await updateManagedQuizQuestion(
        context,
        lessonId,
        question.id,
        question
      );
    } else {
      await createManagedQuizQuestion(
        context,
        lessonId,
        question
      );
    }
  }
}

export async function saveManagedQuizSettings(
  context: CourseContentContext,
  lessonId: number,
  settings: QuizSettingDraft
): Promise<QuizSettingResponse> {
  const request: QuizSettingRequest = {
    passingScore:
      settings.passingScore,
    maxAttempts:
      settings.maxAttempts,
    shuffleQuestions:
      settings.shuffleQuestions,
    shuffleOptions:
      settings.shuffleOptions,
    showResult:
      settings.showResult,
    showCorrectAnswers:
      settings.showResult &&
      settings.showCorrectAnswers,
  };

  const response =
    await api.put<QuizSettingResponse>(
      `${getQuizBasePath(
        context
      )}/lessons/${lessonId}/settings`,
      request
    );

  return response.data;
}

export async function createManagedQuizQuestion(
  context: CourseContentContext,
  lessonId: number,
  question: QuizQuestionDraft
): Promise<QuizQuestionResponse> {
  const response =
    await api.post<QuizQuestionResponse>(
      `${getQuizBasePath(
        context
      )}/lessons/${lessonId}/questions`,
      mapQuestionRequest(question)
    );

  return response.data;
}

export async function updateManagedQuizQuestion(
  context: CourseContentContext,
  lessonId: number,
  questionId: number,
  question: QuizQuestionDraft
): Promise<QuizQuestionResponse> {
  const response =
    await api.put<QuizQuestionResponse>(
      `${getQuizBasePath(
        context
      )}/lessons/${lessonId}/questions/${questionId}`,
      mapQuestionRequest(question)
    );

  return response.data;
}

export async function deleteManagedQuizQuestion(
  context: CourseContentContext,
  lessonId: number,
  questionId: number
): Promise<void> {
  await api.delete(
    `${getQuizBasePath(
      context
    )}/lessons/${lessonId}/questions/${questionId}`
  );
}

function mapSettingDraft(
  setting: QuizSettingResponse
): QuizSettingDraft {
  return {
    id: setting.id,
    lessonId: setting.lessonId,
    passingScore:
      setting.passingScore,
    maxAttempts:
      setting.maxAttempts,
    shuffleQuestions:
      setting.shuffleQuestions,
    shuffleOptions:
      setting.shuffleOptions,
    showResult:
      setting.showResult,
    showCorrectAnswers:
      setting.showCorrectAnswers,
  };
}

function mapQuestionDraft(
  question: QuizQuestionResponse
): QuizQuestionDraft {
  return {
    id: question.id,
    lessonId: question.lessonId,
    clientId:
      `question-${question.id}`,
    questionText:
      question.questionText,
    points:
      question.points,
    explanation:
      question.explanation ?? "",
    sortOrder:
      question.sortOrder,
    active:
      question.active,
    options: question.options
      .slice()
      .sort(
        (first, second) =>
          first.sortOrder -
          second.sortOrder
      )
      .map(mapOptionDraft),
  };
}

function mapOptionDraft(
  option: QuizOptionResponse
): QuizOptionDraft {
  return {
    id: option.id,
    clientId:
      `option-${option.id}`,
    optionText:
      option.optionText,
    correct:
      option.correct,
    sortOrder:
      option.sortOrder,
  };
}

function mapQuestionRequest(
  question: QuizQuestionDraft
): QuizQuestionRequest {
  return {
    questionText:
      question.questionText.trim(),
    points:
      question.points,
    explanation:
      normalizeOptionalText(
        question.explanation
      ),
    sortOrder:
      question.sortOrder,
    active:
      question.active,
    options:
      question.options.map(
        mapOptionRequest
      ),
  };
}

function mapOptionRequest(
  option: QuizOptionDraft
): QuizOptionRequest {
  return {
    optionText:
      option.optionText.trim(),
    correct:
      option.correct,
    sortOrder:
      option.sortOrder,
  };
}

function createDefaultSettings():
  QuizSettingDraft {
  return {
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResult: true,
    showCorrectAnswers: false,
  };
}

function normalizeOptionalText(
  value: string
): string | null {
  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function getQuizBasePath(
  context: CourseContentContext
): string {
  return context === "ADMIN"
    ? "/admin/quiz"
    : "/instructor/quiz";
}