"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  History,
  Loader2,
  RotateCcw,
  Send,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getStudentQuizAttemptResult,
  getStudentQuizAttempts,
  startStudentQuizAttempt,
  submitStudentQuizAttempt,
} from "@/features/student-quiz/services/student-quiz.service";
import type {
  StudentQuiz,
  StudentQuizAttempt,
  StudentQuizResult,
} from "@/features/student-quiz/types/student-quiz.types";

interface StudentQuizPlayerProps {
  lessonId: number;
  lessonTitle: string;
  onPassed?: () => void;
}

type SelectedAnswers = Record<number, number>;

export function StudentQuizPlayer({
  lessonId,
  lessonTitle,
  onPassed,
}: StudentQuizPlayerProps) {
  const [quiz, setQuiz] =
    useState<StudentQuiz | null>(null);

  const [selectedAnswers, setSelectedAnswers] =
    useState<SelectedAnswers>({});

  const [attempts, setAttempts] =
    useState<StudentQuizAttempt[]>([]);

  const [result, setResult] =
    useState<StudentQuizResult | null>(null);

  const [isLoadingAttempts, setIsLoadingAttempts] =
    useState(true);

  const [isStarting, setIsStarting] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isLoadingResult, setIsLoadingResult] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInitialAttempts(): Promise<void> {
      try {
        setIsLoadingAttempts(true);
        setError(null);

        const data =
          await getStudentQuizAttempts(lessonId);

        if (active) {
          setAttempts(data);
        }
      } catch {
        if (active) {
          setError(
            "No se pudo cargar el historial de intentos."
          );
        }
      } finally {
        if (active) {
          setIsLoadingAttempts(false);
        }
      }
    }

    void loadInitialAttempts();

    return () => {
      active = false;
    };
  }, [lessonId]);

  async function loadAttempts(): Promise<void> {
    try {
      setIsLoadingAttempts(true);
      setError(null);

      const data =
        await getStudentQuizAttempts(lessonId);

      setAttempts(data);
    } catch {
      setError(
        "No se pudo cargar el historial de intentos."
      );
    } finally {
      setIsLoadingAttempts(false);
    }
  }

  async function handleStartAttempt(): Promise<void> {
    try {
      setIsStarting(true);
      setError(null);
      setResult(null);
      setSelectedAnswers({});

      const data =
        await startStudentQuizAttempt(lessonId);

      setQuiz(data);
    } catch {
      setError(
        "No se pudo iniciar el cuestionario. Verifica si todavía tienes intentos disponibles."
      );
    } finally {
      setIsStarting(false);
    }
  }

  function handleSelectOption(
    questionId: number,
    optionId: number
  ): void {
    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  const answeredQuestions = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );

  const allQuestionsAnswered =
    quiz !== null &&
    answeredQuestions === quiz.totalQuestions;

  async function handleSubmitAttempt(): Promise<void> {
    if (!quiz) {
      return;
    }

    if (!allQuestionsAnswered) {
      setError(
        "Debes responder todas las preguntas antes de enviar el cuestionario."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response =
        await submitStudentQuizAttempt(
          lessonId,
          {
            attemptId: quiz.attemptId,
            answers: quiz.questions.map(
              (question) => ({
                questionId: question.id,
                selectedOptionId:
                  selectedAnswers[
                    question.id
                  ],
              })
            ),
          }
        );

      setResult(response);
      setQuiz(null);

      await loadAttempts();

      if (response.passed === true) {
        onPassed?.();
      }
    } catch {
      setError(
        "No se pudo enviar el cuestionario. Revisa tus respuestas e inténtalo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleViewResult(
    attemptId: number
  ): Promise<void> {
    try {
      setIsLoadingResult(true);
      setError(null);
      setQuiz(null);

      const response =
        await getStudentQuizAttemptResult(
          attemptId
        );

      setResult(response);
    } catch {
      setError(
        "No se pudo cargar el resultado de este intento."
      );
    } finally {
      setIsLoadingResult(false);
    }
  }

  function handleReturnToOverview(): void {
    setQuiz(null);
    setResult(null);
    setSelectedAnswers({});
    setError(null);
  }

  if (quiz) {
    return (
      <QuizAttemptView
        quiz={quiz}
        selectedAnswers={selectedAnswers}
        answeredQuestions={answeredQuestions}
        allQuestionsAnswered={
          allQuestionsAnswered
        }
        isSubmitting={isSubmitting}
        error={error}
        onSelectOption={handleSelectOption}
        onSubmit={handleSubmitAttempt}
        onCancel={handleReturnToOverview}
      />
    );
  }

  if (result) {
    return (
      <QuizResultView
        result={result}
        isLoading={isLoadingResult}
        onBack={handleReturnToOverview}
        onRetry={handleStartAttempt}
        isRetrying={isStarting}
      />
    );
  }

  return (
    <QuizOverview
      lessonTitle={lessonTitle}
      attempts={attempts}
      isLoadingAttempts={isLoadingAttempts}
      isStarting={isStarting}
      isLoadingResult={isLoadingResult}
      error={error}
      onStart={handleStartAttempt}
      onViewResult={handleViewResult}
    />
  );
}

interface QuizOverviewProps {
  lessonTitle: string;
  attempts: StudentQuizAttempt[];
  isLoadingAttempts: boolean;
  isStarting: boolean;
  isLoadingResult: boolean;
  error: string | null;
  onStart: () => void;
  onViewResult: (
    attemptId: number
  ) => void;
}

function QuizOverview({
  lessonTitle,
  attempts,
  isLoadingAttempts,
  isStarting,
  isLoadingResult,
  error,
  onStart,
  onViewResult,
}: QuizOverviewProps) {
  const completedAttempts =
    attempts.filter(
      (attempt) => attempt.completed
    );

  const hasPendingAttempt =
    attempts.some(
      (attempt) => !attempt.completed
    );

  const bestScore =
    completedAttempts.length > 0
      ? Math.max(
          ...completedAttempts.map(
            (attempt) =>
              Number(attempt.score)
          )
        )
      : null;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <ClipboardCheck className="h-14 w-14 text-primary" />

          <h3 className="mt-4 text-xl font-semibold">
            {lessonTitle}
          </h3>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Responde todas las preguntas y envía
            tus respuestas para conocer tu
            calificación.
          </p>

          {bestScore !== null && (
            <div className="mt-5 rounded-lg border bg-muted/30 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Mejor calificación
              </p>

              <p className="mt-1 text-2xl font-bold">
                {percentageToGrade20(
                  bestScore
                )} / 20
              </p>

              <p className="text-xs text-muted-foreground">
                {formatNumber(bestScore)}%
              </p>
            </div>
          )}

          <Button
            type="button"
            className="mt-6"
            disabled={
              isStarting ||
              isLoadingAttempts
            }
            onClick={onStart}
          >
            {isStarting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hasPendingAttempt ? (
              <RotateCcw className="mr-2 h-4 w-4" />
            ) : (
              <ClipboardCheck className="mr-2 h-4 w-4" />
            )}

            {hasPendingAttempt
              ? "Continuar intento"
              : completedAttempts.length > 0
              ? "Nuevo intento"
              : "Iniciar cuestionario"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5" />
            Historial de intentos
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoadingAttempts ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando intentos...
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no has realizado ningún
              intento.
            </p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        Intento{" "}
                        {attempt.attemptNumber}
                      </p>

                      {!attempt.completed ? (
                        <Badge variant="secondary">
                          En progreso
                        </Badge>
                      ) : attempt.passed ? (
                        <Badge>
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Desaprobado
                        </Badge>
                      )}
                    </div>

                    {attempt.completed && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>
                          Nota:{" "}
                          {percentageToGrade20(
                            Number(attempt.score)
                          )}{" "}
                          / 20
                        </span>

                        <span className="mx-2">
                          •
                        </span>

                        <span>
                          {
                            attempt.correctAnswers
                          }{" "}
                          de{" "}
                          {
                            attempt.totalQuestions
                          }{" "}
                          correctas
                        </span>
                      </div>
                    )}
                  </div>

                  {attempt.completed && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isLoadingResult}
                      onClick={() =>
                        onViewResult(
                          attempt.id
                        )
                      }
                    >
                      {isLoadingResult && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Ver resultado
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface QuizAttemptViewProps {
  quiz: StudentQuiz;
  selectedAnswers: SelectedAnswers;
  answeredQuestions: number;
  allQuestionsAnswered: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSelectOption: (
    questionId: number,
    optionId: number
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function QuizAttemptView({
  quiz,
  selectedAnswers,
  answeredQuestions,
  allQuestionsAnswered,
  isSubmitting,
  error,
  onSelectOption,
  onSubmit,
  onCancel,
}: QuizAttemptViewProps) {
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            Revisa el cuestionario
          </AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>
                {quiz.lessonTitle}
              </CardTitle>

              <p className="mt-2 text-sm text-muted-foreground">
                Intento {quiz.attemptNumber} de{" "}
                {quiz.maxAttempts}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Nota mínima:{" "}
                {percentageToGrade20(
                  Number(quiz.passingScore)
                )}{" "}
                / 20
              </Badge>

              <Badge variant="secondary">
                {quiz.remainingAttempts} intentos
                restantes
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span>
              Preguntas respondidas
            </span>

            <span className="font-semibold">
              {answeredQuestions} de{" "}
              {quiz.totalQuestions}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${
                  quiz.totalQuestions > 0
                    ? (answeredQuestions /
                        quiz.totalQuestions) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {quiz.questions.map(
        (question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {questionIndex + 1}
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-base leading-6">
                    {question.questionText}
                  </CardTitle>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(
                      Number(question.points)
                    )}{" "}
                    puntos
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {question.options.map(
                  (option) => {
                    const selected =
                      selectedAnswers[
                        question.id
                      ] === option.id;

                    return (
                      <label
                        key={option.id}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/40",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={selected}
                          className="mt-1 h-4 w-4 accent-primary"
                          onChange={() =>
                            onSelectOption(
                              question.id,
                              option.id
                            )
                          }
                        />

                        <span className="text-sm leading-6">
                          {option.optionText}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        )
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          disabled={
            isSubmitting ||
            !allQuestionsAnswered
          }
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}

          Enviar cuestionario
        </Button>
      </div>
    </div>
  );
}

interface QuizResultViewProps {
  result: StudentQuizResult;
  isLoading: boolean;
  isRetrying: boolean;
  onBack: () => void;
  onRetry: () => void;
}

function QuizResultView({
  result,
  isLoading,
  isRetrying,
  onBack,
  onRetry,
}: QuizResultViewProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const score =
    result.score !== null
      ? Number(result.score)
      : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          {result.showResult ? (
            result.passed ? (
              <Trophy className="h-16 w-16 text-amber-500" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )
          ) : (
            <ClipboardCheck className="h-16 w-16 text-primary" />
          )}

          <h3 className="mt-4 text-2xl font-bold">
            {result.showResult
              ? result.passed
                ? "Cuestionario aprobado"
                : "Cuestionario desaprobado"
              : "Cuestionario enviado"}
          </h3>

          {result.showResult &&
            score !== null && (
              <>
                <p className="mt-4 text-4xl font-bold">
                  {percentageToGrade20(
                    score
                  )}{" "}
                  / 20
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatNumber(score)}%
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                  {result.correctAnswers ?? 0} de{" "}
                  {result.totalQuestions ?? 0}{" "}
                  respuestas correctas
                </p>
              </>
            )}

          {!result.showResult && (
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              La configuración de esta evaluación
              no permite mostrar la calificación
              inmediatamente.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Volver al historial
            </Button>

            {result.passed !== true && (
              <Button
                type="button"
                disabled={isRetrying}
                onClick={onRetry}
              >
                {isRetrying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}

                Intentar nuevamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result.showResult &&
        result.answers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Revisión de respuestas
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {result.answers.map(
                (answer, index) => (
                  <div
                    key={`${answer.questionId}-${index}`}
                    className={[
                      "rounded-lg border p-4",
                      answer.correct
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-destructive/40 bg-destructive/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {answer.correct ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {index + 1}.{" "}
                          {answer.questionText ??
                            "Pregunta"}
                        </p>

                        <p className="mt-3 text-sm">
                          <span className="font-medium">
                            Tu respuesta:
                          </span>{" "}
                          {answer.selectedOptionText ??
                            "Sin respuesta"}
                        </p>

                        {result.showCorrectAnswers &&
                          !answer.correct &&
                          answer.correctOptionText && (
                            <p className="mt-2 text-sm text-emerald-700">
                              <span className="font-medium">
                                Respuesta correcta:
                              </span>{" "}
                              {
                                answer.correctOptionText
                              }
                            </p>
                          )}

                        {result.showCorrectAnswers &&
                          answer.explanation && (
                            <div className="mt-3 rounded-md bg-background/70 p-3 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Explicación:
                              </span>{" "}
                              {answer.explanation}
                            </div>
                          )}

                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatNumber(
                            Number(
                              answer.pointsEarned
                            )
                          )}{" "}
                          de{" "}
                          {formatNumber(
                            Number(
                              answer.questionPoints
                            )
                          )}{" "}
                          puntos
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function percentageToGrade20(
  percentage: number
): string {
  return formatNumber(
    (percentage / 100) * 20
  );
}

function formatNumber(
  value: number
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}