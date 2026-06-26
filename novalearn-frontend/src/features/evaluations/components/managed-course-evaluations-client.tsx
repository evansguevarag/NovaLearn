"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  FileEdit,
  FileQuestion,
  FileUp,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Settings2,
  TextCursorInput,
  Trash2,
  Workflow,
} from "lucide-react";
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

import { EvaluationFormDialog } from "@/features/evaluations/components/evaluation-form-dialog";
import {
  createManagedEvaluation,
  deleteManagedEvaluation,
  getManagedEvaluations,
  updateManagedEvaluation,
} from "@/features/evaluations/services/evaluation.service";
import type {
  Evaluation,
  EvaluationDeliveryMode,
  EvaluationRequest,
  EvaluationStatus,
  EvaluationType,
} from "@/features/evaluations/types/evaluation.types";
import { ManagedCourseTabs } from "@/features/instructor-content/components/managed-course-tabs";
import {
  getManagedCourseById,
  getManagedCourseModules,
  type CourseContentContext,
  type CourseContentSummary,
} from "@/features/instructor-content/services/course-content.service";
import type {
  InstructorCourseModule,
} from "@/features/instructor-content/types/instructor-content.types";

interface ManagedCourseEvaluationsClientProps {
  courseId: number;
  context: CourseContentContext;
}

interface EvaluationGroup {
  module: InstructorCourseModule;
  evaluations: Evaluation[];
}

export function ManagedCourseEvaluationsClient({
  courseId,
  context,
}: ManagedCourseEvaluationsClientProps) {
  const allowedRoles =
    context === "ADMIN"
      ? (["ADMIN"] as const)
      : (["INSTRUCTOR"] as const);

  const { isChecking } =
    useAuthGuard([...allowedRoles]);

  const [course, setCourse] =
    useState<CourseContentSummary | null>(
      null
    );

  const [modules, setModules] =
    useState<InstructorCourseModule[]>(
      []
    );

  const [evaluations, setEvaluations] =
    useState<Evaluation[]>([]);

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
    selectedEvaluation,
    setSelectedEvaluation,
  ] = useState<Evaluation | null>(
    null
  );

  const [
    initialModuleId,
    setInitialModuleId,
  ] = useState<number | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let cancelled = false;

    async function initialize(): Promise<void> {
      try {
        const [
          courseData,
          moduleData,
          evaluationData,
        ] = await Promise.all([
          getManagedCourseById(
            context,
            courseId
          ),
          getManagedCourseModules(
            context,
            courseId
          ),
          getManagedEvaluations(
            context,
            courseId
          ),
        ]);

        if (cancelled) {
          return;
        }

        setCourse(courseData);
        setModules(
          [...moduleData].sort(
            (first, second) =>
              first.sortOrder -
              second.sortOrder
          )
        );

        setEvaluations(
          sortEvaluations(
            evaluationData
          )
        );
      } catch (
        loadError: unknown
      ) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudieron cargar las evaluaciones."
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
    courseId,
    isChecking,
  ]);

  const groups = useMemo<
    EvaluationGroup[]
  >(
    () =>
      modules
        .map((courseModule) => ({
          module: courseModule,
          evaluations:
            sortEvaluations(
              evaluations.filter(
                (evaluation) =>
                  evaluation.moduleId ===
                  courseModule.id
              )
            ),
        }))
        .filter(
          (group) =>
            group.evaluations.length > 0
        ),
    [
      evaluations,
      modules,
    ]
  );

  const publishedCount =
    evaluations.filter(
      (evaluation) =>
        evaluation.status ===
        "PUBLISHED"
    ).length;

  const draftCount =
    evaluations.filter(
      (evaluation) =>
        evaluation.status ===
        "DRAFT"
    ).length;

  const closedCount =
    evaluations.filter(
      (evaluation) =>
        evaluation.status ===
        "CLOSED"
    ).length;

  const basePath =
    context === "ADMIN"
      ? `/admin/courses/${courseId}`
      : `/instructor/courses/${courseId}`;

  function openGeneralCreate(): void {
    setSelectedEvaluation(null);
    setInitialModuleId(null);
    setIsFormOpen(true);
  }

  function openModuleCreate(
    moduleId: number
  ): void {
    setSelectedEvaluation(null);
    setInitialModuleId(moduleId);
    setIsFormOpen(true);
  }

  function openEdit(
    evaluation: Evaluation
  ): void {
    setSelectedEvaluation(
      evaluation
    );
    setInitialModuleId(
      evaluation.moduleId
    );
    setIsFormOpen(true);
  }

  async function reload(): Promise<void> {
    const data =
      await getManagedEvaluations(
        context,
        courseId
      );

    setEvaluations(
      sortEvaluations(data)
    );
  }

  async function handleSubmit(
    request: EvaluationRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);

      if (selectedEvaluation) {
        await updateManagedEvaluation(
          context,
          selectedEvaluation.id,
          request
        );

        toast.success(
          "Evaluación actualizada correctamente."
        );
      } else {
        await createManagedEvaluation(
          context,
          request
        );

        toast.success(
          "Evaluación creada correctamente."
        );
      }

      setIsFormOpen(false);
      setSelectedEvaluation(null);
      setInitialModuleId(null);

      await reload();
    } catch (
      submitError: unknown
    ) {
      toast.error(
        getApiErrorMessage(
          submitError,
          "No se pudo guardar la evaluación."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(
    evaluation: Evaluation
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `¿Eliminar la evaluación "${evaluation.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteManagedEvaluation(
        context,
        evaluation.id
      );

      toast.success(
        "Evaluación eliminada correctamente."
      );

      await reload();
    } catch (
      deleteError: unknown
    ) {
      toast.error(
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar la evaluación."
        )
      );
    }
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Evaluaciones"
        description="Cargando evaluaciones."
      >
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No fue posible abrir el curso."
      >
        <Alert variant="destructive">
          <AlertTitle>
            Error
          </AlertTitle>
          <AlertDescription>
            {error ??
              "No se encontró el curso solicitado."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell
        title="Evaluaciones del curso"
        description={course.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
            >
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al curso
              </Link>
            </Button>

            <Button
              onClick={
                openGeneralCreate
              }
              disabled={
                modules.length === 0
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva evaluación
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <ManagedCourseTabs
            courseId={courseId}
            context={context}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total"
              value={evaluations.length}
              icon={ClipboardCheck}
            />
            <MetricCard
              title="Publicadas"
              value={publishedCount}
              icon={ClipboardCheck}
            />
            <MetricCard
              title="Borradores"
              value={draftCount}
              icon={FileEdit}
            />
            <MetricCard
              title="Cerradas"
              value={closedCount}
              icon={CalendarClock}
            />
          </section>

          {modules.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <Layers3 className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                  Primero crea las semanas
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Las evaluaciones deben
                  pertenecer a un módulo
                  del curso.
                </p>
              </CardContent>
            </Card>
          ) : evaluations.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                  Este curso todavía no tiene evaluaciones
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Crea la primera evaluación
                  y selecciona su modalidad.
                </p>
                <Button
                  className="mt-5"
                  onClick={
                    openGeneralCreate
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera evaluación
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {groups.map((group) => (
                <EvaluationGroupCard
                  key={group.module.id}
                  group={group}
                  context={context}
                  onCreate={() =>
                    openModuleCreate(
                      group.module.id
                    )
                  }
                  onEdit={openEdit}
                  onDelete={
                    handleDelete
                  }
                />
              ))}
            </div>
          )}
        </div>
      </DashboardShell>

      <EvaluationFormDialog
        open={isFormOpen}
        evaluation={
          selectedEvaluation
        }
        modules={modules}
        initialModuleId={
          initialModuleId
        }
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open) {
            setSelectedEvaluation(
              null
            );
            setInitialModuleId(null);
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

function EvaluationGroupCard({
  group,
  context,
  onCreate,
  onEdit,
  onDelete,
}: {
  group: EvaluationGroup;
  context: CourseContentContext;
  onCreate: () => void;
  onEdit: (
    evaluation: Evaluation
  ) => void;
  onDelete: (
    evaluation: Evaluation
  ) => Promise<void>;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Semana{" "}
                {group.module.sortOrder}
              </Badge>
              <Badge variant="secondary">
                {group.evaluations.length}{" "}
                {group.evaluations.length ===
                1
                  ? "evaluación"
                  : "evaluaciones"}
              </Badge>
            </div>

            <CardTitle className="mt-3 text-lg">
              {group.module.title}
            </CardTitle>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear en esta semana
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-6">
        {group.evaluations.map(
          (evaluation) => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={
                evaluation
              }
              questionsHref={
                context === "ADMIN"
                  ? `/admin/evaluations/${evaluation.id}/questions`
                  : `/instructor/evaluations/${evaluation.id}/questions`
              }
              onEdit={() =>
                onEdit(evaluation)
              }
              onDelete={() =>
                void onDelete(
                  evaluation
                )
              }
            />
          )
        )}
      </CardContent>
    </Card>
  );
}

function EvaluationCard({
  evaluation,
  questionsHref,
  onEdit,
  onDelete,
}: {
  evaluation: Evaluation;
  questionsHref: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
return (
    <article className="rounded-xl border p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              status={
                evaluation.status
              }
            />

            <Badge variant="secondary">
              {getTypeLabel(
                evaluation.evaluationType
              )}
            </Badge>

            <Badge variant="outline">
              {renderDeliveryIcon(
                evaluation.deliveryMode
              )}
              {getDeliveryLabel(
                evaluation.deliveryMode
              )}
            </Badge>

            <Badge variant="outline">
              {evaluation.maxScore} puntos
            </Badge>

            {evaluation.visibleInContent && (
              <Badge variant="outline">
                Visible en contenido
              </Badge>
            )}
          </div>

          <h3 className="mt-3 font-semibold">
            {evaluation.title}
          </h3>

          {evaluation.description && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {evaluation.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              Apertura:{" "}
              {formatDateTime(
                evaluation.availableFrom
              )}
            </span>
            <span>
              Cierre:{" "}
              {formatDateTime(
                evaluation.dueAt
              )}
            </span>
            <span>
              Intentos:{" "}
              {evaluation.maxAttempts}
            </span>

            {evaluation.deliveryMode ===
              "ONLINE_QUIZ" && (
              <span>
                Tiempo:{" "}
                {evaluation.timeLimitMinutes
                  ? `${evaluation.timeLimitMinutes} min`
                  : "Sin límite"}
              </span>
            )}

            {(evaluation.deliveryMode ===
              "FILE_SUBMISSION" ||
              evaluation.deliveryMode ===
                "HYBRID") && (
              <span>
                Archivos: hasta{" "}
                {evaluation.maxFiles ?? 1}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {evaluation.deliveryMode ===
            "ONLINE_QUIZ" && (
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href={questionsHref}>
                <Settings2 className="mr-2 h-4 w-4" />
                Configurar preguntas
              </Link>
            </Button>
          )}

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
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: EvaluationStatus;
}) {
  if (status === "PUBLISHED") {
    return <Badge>Publicada</Badge>;
  }

  if (status === "CLOSED") {
    return (
      <Badge variant="secondary">
        Cerrada
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      Borrador
    </Badge>
  );
}

function getTypeLabel(
  type: EvaluationType
): string {
  if (type === "PRACTICE") {
    return "Práctica calificada";
  }

  if (type === "MIDTERM") {
    return "Examen parcial";
  }

  if (type === "FINAL_EXAM") {
    return "Examen final";
  }

  return "Quiz";
}

function getDeliveryLabel(
  mode: EvaluationDeliveryMode
): string {
  if (mode === "TEXT_SUBMISSION") {
    return "Respuesta escrita";
  }

  if (mode === "FILE_SUBMISSION") {
    return "Entrega de archivos";
  }

  if (mode === "HYBRID") {
    return "Híbrida";
  }

  return "Cuestionario en línea";
}

function renderDeliveryIcon(
  mode: EvaluationDeliveryMode
): React.ReactNode {
  const className =
    "mr-1 h-3.5 w-3.5";

  if (mode === "TEXT_SUBMISSION") {
    return (
      <TextCursorInput
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (mode === "FILE_SUBMISSION") {
    return (
      <FileUp
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (mode === "HYBRID") {
    return (
      <Workflow
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <FileQuestion
      className={className}
      aria-hidden="true"
    />
  );
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function sortEvaluations(
  evaluations: Evaluation[]
): Evaluation[] {
  return [...evaluations].sort(
    (first, second) =>
      first.moduleSortOrder -
        second.moduleSortOrder ||
      first.sortOrder -
        second.sortOrder ||
      first.id - second.id
  );
}