"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

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
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import {
  saveEvaluationAttemptAnswers,
  startEvaluationAttempt,
  submitEvaluationAttempt,
} from "@/features/student-evaluations/services/evaluation-attempt.service";
import type {
  EvaluationAttemptDetail,
  EvaluationAttemptQuestion,
} from "@/features/student-evaluations/types/evaluation-attempt.types";

interface EvaluationAttemptPlayerProps {
  evaluationId: number;
}

type AnswerState = Record<
  number,
  {
    textAnswer: string;
    selectedOptionIds: number[];
  }
>;

export function EvaluationAttemptPlayer({
  evaluationId,
}: EvaluationAttemptPlayerProps) {
  const { isChecking } =
    useAuthGuard(["STUDENT"]);

  const [attempt, setAttempt] =
    useState<EvaluationAttemptDetail | null>(
      null
    );

  const [answers, setAnswers] =
    useState<AnswerState>({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [currentTimeMs, setCurrentTimeMs] =
    useState<number | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let cancelled = false;

    async function loadAttempt(): Promise<void> {
      try {
        setError(null);

        const data =
          await startEvaluationAttempt(
            evaluationId
          );

        if (!cancelled) {
          setAttempt(data);
          setAnswers(
            createAnswerState(data.questions)
          );
        }
      } catch (
        loadError: unknown
      ) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudo iniciar la evaluación."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAttempt();

    return () => {
      cancelled = true;
    };
  }, [
    evaluationId,
    isChecking,
  ]);

  useEffect(() => {
    if (
      !attempt?.expiresAt ||
      attempt.status !== "IN_PROGRESS"
    ) {
      return;
    }

    const updateClock = (): void => {
      setCurrentTimeMs(Date.now());
    };

    const initialTimeoutId =
      window.setTimeout(
        updateClock,
        0
      );

    const intervalId =
      window.setInterval(
        updateClock,
        1000
      );

    return () => {
      window.clearTimeout(
        initialTimeoutId
      );
      window.clearInterval(
        intervalId
      );
    };
  }, [
    attempt?.expiresAt,
    attempt?.status,
  ]);

  const secondsRemaining =
    getSecondsRemaining(
      attempt,
      currentTimeMs
    );

  const answerRequests = useMemo(
    () =>
      Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId: Number(questionId),
          textAnswer:
            answer.textAnswer.trim() ||
            null,
          selectedOptionIds:
            answer.selectedOptionIds,
        })
      ),
    [answers]
  );

  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) =>
          answer.textAnswer.trim().length >
            0 ||
          answer.selectedOptionIds.length >
            0
      ).length,
    [answers]
  );

  const save = useCallback(
    async (
      showSuccessMessage: boolean
    ): Promise<EvaluationAttemptDetail | null> => {
      if (!attempt) {
        return null;
      }

      try {
        setIsSaving(true);
        setError(null);

        const updated =
          await saveEvaluationAttemptAnswers(
            attempt.id,
            {
              answers: answerRequests,
            }
          );

        setAttempt(updated);

        if (showSuccessMessage) {
          toast.success(
            "Respuestas guardadas."
          );
        }

        return updated;
      } catch (
        saveError: unknown
      ) {
        setError(
          getApiErrorMessage(
            saveError,
            "No se pudieron guardar las respuestas."
          )
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [
      answerRequests,
      attempt,
    ]
  );

  async function submit(): Promise<void> {
    if (!attempt) {
      return;
    }

    const unansweredRequired =
      attempt.questions.filter(
        (question) =>
          question.required &&
          !hasAnswer(
            answers[question.id]
          )
      );

    if (
      unansweredRequired.length > 0 &&
      !window.confirm(
        `Hay ${unansweredRequired.length} pregunta(s) obligatoria(s) sin responder. ¿Deseas enviar de todas maneras?`
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        "¿Confirmas que deseas enviar la evaluación? Después no podrás cambiar tus respuestas."
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const saved = await save(false);

      if (!saved) {
        return;
      }

      const submitted =
        await submitEvaluationAttempt(
          saved.id
        );

      setAttempt(submitted);
      toast.success(
        "Evaluación enviada correctamente."
      );
    } catch (
      submitError: unknown
    ) {
      setError(
        getApiErrorMessage(
          submitError,
          "No se pudo enviar la evaluación."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectSingle(
    questionId: number,
    optionId: number
  ): void {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        textAnswer: "",
        selectedOptionIds: [optionId],
      },
    }));
  }

  function toggleMultiple(
    questionId: number,
    optionId: number
  ): void {
    setAnswers((current) => {
      const currentAnswer =
        current[questionId] ?? {
          textAnswer: "",
          selectedOptionIds: [],
        };

      const selected =
        currentAnswer.selectedOptionIds.includes(
          optionId
        );

      return {
        ...current,
        [questionId]: {
          textAnswer: "",
          selectedOptionIds: selected
            ? currentAnswer.selectedOptionIds.filter(
                (id) => id !== optionId
              )
            : [
                ...currentAnswer.selectedOptionIds,
                optionId,
              ],
        },
      };
    });
  }

  function updateText(
    questionId: number,
    value: string
  ): void {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        textAnswer: value,
        selectedOptionIds: [],
      },
    }));
  }

  if (isChecking || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error && !attempt) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            No se pudo abrir la evaluación
          </AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!attempt) {
    return null;
  }

  const finished =
    attempt.status !== "IN_PROGRESS";

  return (
    <main className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-3"
            >
              <Link
                href={`/student/evaluations/${evaluationId}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>

            <h1 className="mt-1 text-xl font-bold">
              {attempt.evaluationTitle}
            </h1>

            <p className="text-sm text-muted-foreground">
              Intento {attempt.attemptNumber}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {answeredCount} de{" "}
              {attempt.questions.length} respondidas
            </Badge>

            {secondsRemaining !== null && (
              <Badge
                variant={
                  secondsRemaining <= 300
                    ? "destructive"
                    : "secondary"
                }
              >
                <Clock3 className="mr-1 h-3.5 w-3.5" />
                {formatTimer(secondsRemaining)}
              </Badge>
            )}

            {!finished && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isSaving ||
                    isSubmitting
                  }
                  onClick={() =>
                    void save(true)
                  }
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar
                </Button>

                <Button
                  type="button"
                  disabled={
                    isSaving ||
                    isSubmitting
                  }
                  onClick={() =>
                    void submit()
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {finished && (
          <AttemptResult attempt={attempt} />
        )}

        {attempt.questions.map(
          (question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              answer={answers[question.id]}
              disabled={finished}
              onSelectSingle={selectSingle}
              onToggleMultiple={toggleMultiple}
              onTextChange={updateText}
            />
          )
        )}

        {!finished && (
          <Card>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Revisa todas tus respuestas antes de enviar.
              </p>

              <Button
                type="button"
                disabled={
                  isSaving ||
                  isSubmitting
                }
                onClick={() =>
                  void submit()
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar evaluación
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function QuestionCard({
  question,
  questionNumber,
  answer,
  disabled,
  onSelectSingle,
  onToggleMultiple,
  onTextChange,
}: {
  question: EvaluationAttemptQuestion;
  questionNumber: number;
  answer:
    | AnswerState[number]
    | undefined;
  disabled: boolean;
  onSelectSingle: (
    questionId: number,
    optionId: number
  ) => void;
  onToggleMultiple: (
    questionId: number,
    optionId: number
  ) => void;
  onTextChange: (
    questionId: number,
    value: string
  ) => void;
}) {
  const multiple =
    question.questionType ===
    "MULTIPLE_CHOICE";

  const shortAnswer =
    question.questionType ===
    "SHORT_ANSWER";

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            Pregunta {questionNumber}
          </Badge>
          <Badge variant="outline">
            {question.points} puntos
          </Badge>
          {question.required && (
            <Badge variant="outline">
              Obligatoria
            </Badge>
          )}
          {question.correct === true && (
            <Badge>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Correcta
            </Badge>
          )}
          {question.correct === false && (
            <Badge variant="destructive">
              Incorrecta
            </Badge>
          )}
        </div>

        <CardTitle className="mt-3 text-lg leading-7">
          {question.prompt}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-6">
        {shortAnswer ? (
          <textarea
            value={
              answer?.textAnswer ?? ""
            }
            disabled={disabled}
            rows={5}
            placeholder="Escribe tu respuesta..."
            className="min-h-32 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
            onChange={(event) =>
              onTextChange(
                question.id,
                event.target.value
              )
            }
          />
        ) : (
          question.options.map(
            (option) => {
              const selected =
                answer?.selectedOptionIds.includes(
                  option.id
                ) ?? false;

              const inputType =
                multiple
                  ? "checkbox"
                  : "radio";

              return (
                <label
                  key={option.id}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40",
                    disabled
                      ? "cursor-default"
                      : "",
                  ].join(" ")}
                >
                  <input
                    type={inputType}
                    name={`question-${question.id}`}
                    checked={selected}
                    disabled={disabled}
                    className="mt-1 h-4 w-4"
                    onChange={() => {
                      if (multiple) {
                        onToggleMultiple(
                          question.id,
                          option.id
                        );
                      } else {
                        onSelectSingle(
                          question.id,
                          option.id
                        );
                      }
                    }}
                  />

                  <span className="flex-1 text-sm leading-6">
                    {option.optionText}
                  </span>

                  {option.correct === true && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  )}
                </label>
              );
            }
          )
        )}

        {question.explanation && (
          <Alert>
            <AlertTitle>
              Explicación
            </AlertTitle>
            <AlertDescription>
              {question.explanation}
            </AlertDescription>
          </Alert>
        )}

        {question.pointsEarned !== null && (
          <p className="text-sm font-medium">
            Puntaje obtenido:{" "}
            {question.pointsEarned} de{" "}
            {question.points}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AttemptResult({
  attempt,
}: {
  attempt: EvaluationAttemptDetail;
}) {
  const pendingManualReview =
    attempt.status === "SUBMITTED";

  return (
    <Alert>
      {pendingManualReview ? (
        <Clock3 className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}

      <AlertTitle>
        {pendingManualReview
          ? "Pendiente de revisión"
          : "Evaluación calificada"}
      </AlertTitle>

      <AlertDescription>
        {pendingManualReview
          ? "Tu intento fue enviado y contiene respuestas que deben ser revisadas por el instructor."
          : attempt.score === null
            ? "El resultado no está disponible."
            : `Obtuviste ${attempt.score} de ${attempt.maxScore} puntos.${
                attempt.passed === true
                  ? " Aprobaste la evaluación."
                  : attempt.passed === false
                    ? " No alcanzaste el puntaje aprobatorio."
                    : ""
              }`}
      </AlertDescription>
    </Alert>
  );
}

function createAnswerState(
  questions: EvaluationAttemptQuestion[]
): AnswerState {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      {
        textAnswer:
          question.textAnswer ?? "",
        selectedOptionIds:
          question.selectedOptionIds,
      },
    ])
  );
}

function hasAnswer(
  answer:
    | {
        textAnswer: string;
        selectedOptionIds: number[];
      }
    | undefined
): boolean {
  return Boolean(
    answer &&
      (
        answer.textAnswer.trim().length >
          0 ||
        answer.selectedOptionIds.length >
          0
      )
  );
}


function getSecondsRemaining(
  attempt: EvaluationAttemptDetail | null,
  currentTimeMs: number | null
): number | null {
  if (
    !attempt?.expiresAt ||
    attempt.status !== "IN_PROGRESS" ||
    currentTimeMs === null
  ) {
    return null;
  }

  const expirationTimeMs =
    new Date(
      attempt.expiresAt
    ).getTime();

  return Math.max(
    0,
    Math.floor(
      (expirationTimeMs - currentTimeMs) /
        1000
    )
  );
}

function formatTimer(
  totalSeconds: number
): string {
  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}