"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
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

import { EvaluationQuestionFormDialog } from "@/features/evaluations/components/evaluation-question-form-dialog";
import {
  createEvaluationQuestion,
  deleteEvaluationQuestion,
  getEvaluationQuestions,
  getManagedEvaluation,
  updateEvaluationQuestion,
} from "@/features/evaluations/services/evaluation-question.service";
import type {
  EvaluationQuestion,
  EvaluationQuestionRequest,
  EvaluationQuestionType,
} from "@/features/evaluations/types/evaluation-question.types";
import type {
  Evaluation,
} from "@/features/evaluations/types/evaluation.types";
import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";

interface ManagedEvaluationQuestionsClientProps {
  evaluationId: number;
  context: CourseContentContext;
}

export function ManagedEvaluationQuestionsClient({
  evaluationId,
  context,
}: ManagedEvaluationQuestionsClientProps) {
  const allowedRoles =
    context === "ADMIN"
      ? (["ADMIN"] as const)
      : (["INSTRUCTOR"] as const);

  const { isChecking } =
    useAuthGuard([...allowedRoles]);

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [questions, setQuestions] =
    useState<EvaluationQuestion[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [
    selectedQuestion,
    setSelectedQuestion,
  ] = useState<EvaluationQuestion | null>(
    null
  );

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let cancelled = false;

    async function initialize(): Promise<void> {
      try {
        const [
          evaluationData,
          questionData,
        ] = await Promise.all([
          getManagedEvaluation(
            context,
            evaluationId
          ),
          getEvaluationQuestions(
            context,
            evaluationId
          ),
        ]);

        if (cancelled) {
          return;
        }

        setEvaluation(evaluationData);
        setQuestions(
          sortQuestions(questionData)
        );
      } catch (
        loadError: unknown
      ) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudo cargar la configuración del cuestionario."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [
    context,
    evaluationId,
    isChecking,
  ]);

  const totalPoints =
    useMemo(
      () =>
        questions.reduce(
          (total, question) =>
            total + question.points,
          0
        ),
      [questions]
    );

  const suggestedSortOrder =
    useMemo(
      () =>
        questions.length === 0
          ? 1
          : Math.max(
              ...questions.map(
                (question) =>
                  question.sortOrder
              )
            ) + 1,
      [questions]
    );

  const basePath =
    evaluation
      ? context === "ADMIN"
        ? `/admin/courses/${evaluation.courseId}/evaluations`
        : `/instructor/courses/${evaluation.courseId}/evaluations`
      : context === "ADMIN"
      ? "/admin/courses"
      : "/instructor/courses";

  async function reload(): Promise<void> {
    const data =
      await getEvaluationQuestions(
        context,
        evaluationId
      );

    setQuestions(
      sortQuestions(data)
    );
  }

  function openCreate(): void {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  }

  function openEdit(
    question: EvaluationQuestion
  ): void {
    setSelectedQuestion(question);
    setIsFormOpen(true);
  }

  async function handleSubmit(
    request: EvaluationQuestionRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);

      if (selectedQuestion) {
        await updateEvaluationQuestion(
          context,
          evaluationId,
          selectedQuestion.id,
          request
        );

        toast.success(
          "Pregunta actualizada correctamente."
        );
      } else {
        await createEvaluationQuestion(
          context,
          evaluationId,
          request
        );

        toast.success(
          "Pregunta creada correctamente."
        );
      }

      setIsFormOpen(false);
      setSelectedQuestion(null);

      await reload();
    } catch (
      submitError: unknown
    ) {
      toast.error(
        getApiErrorMessage(
          submitError,
          "No se pudo guardar la pregunta."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(
    question: EvaluationQuestion
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `¿Eliminar la pregunta "${question.prompt}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEvaluationQuestion(
        context,
        evaluationId,
        question.id
      );

      toast.success(
        "Pregunta eliminada correctamente."
      );

      await reload();
    } catch (
      deleteError: unknown
    ) {
      toast.error(
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar la pregunta."
        )
      );
    }
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Configurar cuestionario"
        description="Cargando preguntas."
      >
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  if (!evaluation) {
    return (
      <DashboardShell
        title="Evaluación no disponible"
        description="No fue posible abrir la evaluación."
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ??
              "No se encontró la evaluación solicitada."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell
        title="Configurar cuestionario"
        description={evaluation.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
            >
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a evaluaciones
              </Link>
            </Button>

            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva pregunta
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <section className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              title="Preguntas"
              value={questions.length}
              icon={FileQuestion}
            />
            <MetricCard
              title="Puntaje configurado"
              value={totalPoints}
              icon={CheckCircle2}
            />
            <MetricCard
              title="Puntaje máximo"
              value={evaluation.maxScore}
              icon={CircleHelp}
            />
          </section>

          {totalPoints !==
            evaluation.maxScore && (
            <Alert>
              <AlertTitle>
                Revisa el puntaje total
              </AlertTitle>
              <AlertDescription>
                Las preguntas suman{" "}
                {totalPoints} puntos,
                mientras que la evaluación
                tiene un máximo de{" "}
                {evaluation.maxScore}.
              </AlertDescription>
            </Alert>
          )}

          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                  Todavía no hay preguntas
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Agrega la primera pregunta
                  para empezar a construir
                  el cuestionario.
                </p>
                <Button
                  className="mt-5"
                  onClick={openCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera pregunta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map(
                (question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onEdit={() =>
                      openEdit(question)
                    }
                    onDelete={() =>
                      void handleDelete(
                        question
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </DashboardShell>

      <EvaluationQuestionFormDialog
        open={isFormOpen}
        question={selectedQuestion}
        suggestedSortOrder={
          suggestedSortOrder
        }
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open) {
            setSelectedQuestion(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function QuestionCard({
  question,
  onEdit,
  onDelete,
}: {
  question: EvaluationQuestion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Pregunta{" "}
                {question.sortOrder}
              </Badge>
              <Badge variant="secondary">
                {getQuestionTypeLabel(
                  question.questionType
                )}
              </Badge>
              <Badge variant="outline">
                {question.points} puntos
              </Badge>
              {question.required && (
                <Badge>Obligatoria</Badge>
              )}
            </div>

            <h3 className="mt-3 font-semibold">
              {question.prompt}
            </h3>

            {question.explanation && (
              <p className="mt-2 text-sm text-muted-foreground">
                {question.explanation}
              </p>
            )}

            {question.options.length > 0 && (
              <div className="mt-4 space-y-2">
                {question.options.map(
                  (option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={[
                          "inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                          option.correct
                            ? "border-primary bg-primary text-primary-foreground"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {option.sortOrder}
                      </span>
                      <span>
                        {option.optionText}
                      </span>
                      {option.correct && (
                        <Badge
                          variant="outline"
                          className="ml-1"
                        >
                          Correcta
                        </Badge>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">
                Eliminar
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getQuestionTypeLabel(
  type: EvaluationQuestionType
): string {
  if (type === "MULTIPLE_CHOICE") {
    return "Opción múltiple";
  }

  if (type === "TRUE_FALSE") {
    return "Verdadero o falso";
  }

  if (type === "SHORT_ANSWER") {
    return "Respuesta corta";
  }

  return "Opción única";
}

function sortQuestions(
  questions: EvaluationQuestion[]
): EvaluationQuestion[] {
  return [...questions].sort(
    (first, second) =>
      first.sortOrder -
        second.sortOrder ||
      first.id - second.id
  );
}