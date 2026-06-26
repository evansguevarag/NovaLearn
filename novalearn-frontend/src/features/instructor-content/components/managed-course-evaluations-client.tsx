"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  FileQuestion,
  Layers3,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";

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

import { ManagedCourseTabs } from "@/features/instructor-content/components/managed-course-tabs";
import {
  getManagedCourseById,
  getManagedCourseModules,
  getManagedLessonsByModule,
  type CourseContentContext,
  type CourseContentSummary,
} from "@/features/instructor-content/services/course-content.service";
import type {
  InstructorCourseModule,
  InstructorLesson,
} from "@/features/instructor-content/types/instructor-content.types";

interface ManagedCourseEvaluationsClientProps {
  courseId: number;
  context: CourseContentContext;
}

interface EvaluationModule
  extends InstructorCourseModule {
  evaluations: InstructorLesson[];
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

  const [
    evaluationModules,
    setEvaluationModules,
  ] = useState<EvaluationModule[]>([]);

  const [
    expandedModules,
    setExpandedModules,
  ] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    async function loadEvaluations(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const [
          courseData,
          modulesData,
        ] = await Promise.all([
          getManagedCourseById(
            context,
            courseId
          ),
          getManagedCourseModules(
            context,
            courseId
          ),
        ]);

        const sortedModules = [
          ...modulesData,
        ].sort(
          (first, second) =>
            first.sortOrder -
            second.sortOrder
        );

        const modulesWithEvaluations =
          await Promise.all(
            sortedModules.map(
              async (
                courseModule
              ): Promise<EvaluationModule> => {
                const lessons =
                  await getManagedLessonsByModule(
                    context,
                    courseModule.id
                  );

                const evaluations = lessons
                  .filter(
                    (lesson) =>
                      lesson.lessonType ===
                      "QUIZ"
                  )
                  .sort(
                    (first, second) =>
                      first.sortOrder -
                      second.sortOrder
                  );

                return {
                  ...courseModule,
                  evaluations,
                };
              }
            )
          );

        if (isCancelled) {
          return;
        }

        setCourse(courseData);
        setEvaluationModules(
          modulesWithEvaluations
        );

        setExpandedModules(
          new Set(
            modulesWithEvaluations
              .filter(
                (courseModule) =>
                  courseModule.evaluations
                    .length > 0
              )
              .map(
                (courseModule) =>
                  courseModule.id
              )
          )
        );
      } catch (loadError: unknown) {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudieron cargar las evaluaciones del curso."
            )
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEvaluations();

    return () => {
      isCancelled = true;
    };
  }, [
    context,
    courseId,
    isChecking,
  ]);

  const allEvaluations = useMemo(
    () =>
      evaluationModules.flatMap(
        (courseModule) =>
          courseModule.evaluations
      ),
    [evaluationModules]
  );

  const activeEvaluations = useMemo(
    () =>
      allEvaluations.filter(
        (evaluation) =>
          evaluation.active
      ).length,
    [allEvaluations]
  );

  const inactiveEvaluations =
    allEvaluations.length -
    activeEvaluations;

  const modulesWithEvaluations =
    evaluationModules.filter(
      (courseModule) =>
        courseModule.evaluations.length >
        0
    ).length;

  const basePath =
    context === "ADMIN"
      ? `/admin/courses/${courseId}`
      : `/instructor/courses/${courseId}`;

  const backLabel =
    context === "ADMIN"
      ? "Volver a la administración"
      : "Volver al curso";

  function toggleModule(
    moduleId: number
  ): void {
    setExpandedModules((current) => {
      const next = new Set(current);

      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }

      return next;
    });
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Evaluaciones"
        description="Cargando evaluaciones del curso."
      >
        <div className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando evaluaciones...
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No se pudo abrir el curso solicitado."
      >
        <Alert variant="destructive">
          <AlertTitle>
            Error
          </AlertTitle>

          <AlertDescription>
            {error ??
              "El curso no existe o no tienes permiso para administrarlo."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  return (
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
              {backLabel}
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`${basePath}/content`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva evaluación
            </Link>
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
            <AlertTitle>
              Error
            </AlertTitle>

            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Evaluaciones"
            value={allEvaluations.length}
            icon={ClipboardCheck}
          />

          <MetricCard
            title="Activas"
            value={activeEvaluations}
            icon={CheckCircle2}
          />

          <MetricCard
            title="Inactivas"
            value={inactiveEvaluations}
            icon={EyeOff}
          />

          <MetricCard
            title="Semanas evaluadas"
            value={modulesWithEvaluations}
            icon={Layers3}
          />
        </section>

        {evaluationModules.length ===
        0 ? (
          <EmptyCourseStructure
            contentHref={`${basePath}/content`}
          />
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Evaluaciones por semana
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Cada evaluación permanece vinculada
                al módulo o semana donde fue creada.
              </p>
            </CardHeader>

            <CardContent className="p-0">
              {evaluationModules.map(
                (courseModule) => (
                  <EvaluationModuleSection
                    key={courseModule.id}
                    module={courseModule}
                    expanded={expandedModules.has(
                      courseModule.id
                    )}
                    contentHref={`${basePath}/content`}
                    onToggle={() =>
                      toggleModule(
                        courseModule.id
                      )
                    }
                  />
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
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

interface EvaluationModuleSectionProps {
  module: EvaluationModule;
  expanded: boolean;
  contentHref: string;
  onToggle: () => void;
}

function EvaluationModuleSection({
  module,
  expanded,
  contentHref,
  onToggle,
}: EvaluationModuleSectionProps) {
  const activeCount =
    module.evaluations.filter(
      (evaluation) =>
        evaluation.active
    ).length;

  return (
    <section className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/40 sm:px-6"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="mt-0.5">
          {expanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Layers3 className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              Semana {module.sortOrder}
            </Badge>

            <Badge
              variant={
                module.active
                  ? "default"
                  : "secondary"
              }
            >
              {module.active
                ? "Activa"
                : "Inactiva"}
            </Badge>

            <Badge variant="secondary">
              {module.evaluations.length}{" "}
              {module.evaluations.length === 1
                ? "evaluación"
                : "evaluaciones"}
            </Badge>
          </div>

          <h2 className="mt-3 font-semibold sm:text-lg">
            {module.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {module.description?.trim() ||
              "Esta semana todavía no tiene una descripción."}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {activeCount} de{" "}
            {module.evaluations.length}{" "}
            evaluaciones activas
          </p>
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-muted/10 p-4 sm:p-6">
          {module.evaluations.length ===
          0 ? (
            <div className="rounded-xl border border-dashed bg-background p-6 text-center">
              <FileQuestion className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-3 font-medium">
                Esta semana no tiene evaluaciones
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Crea un cuestionario dentro de esta
                semana desde la gestión de contenido.
              </p>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-4"
              >
                <Link href={contentHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear evaluación
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {module.evaluations.map(
                (evaluation) => (
                  <EvaluationItem
                    key={evaluation.id}
                    evaluation={evaluation}
                    contentHref={
                      contentHref
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

interface EvaluationItemProps {
  evaluation: InstructorLesson;
  contentHref: string;
}

function EvaluationItem({
  evaluation,
  contentHref,
}: EvaluationItemProps) {
  return (
    <article className="rounded-xl border bg-background p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileQuestion className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Evaluación{" "}
                {evaluation.sortOrder}
              </Badge>

              <Badge
                variant={
                  evaluation.active
                    ? "default"
                    : "secondary"
                }
              >
                {evaluation.active
                  ? "Publicada"
                  : "Inactiva"}
              </Badge>

              <Badge variant="secondary">
                Cuestionario
              </Badge>
            </div>

            <h3 className="mt-3 font-semibold">
              {evaluation.title}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {evaluation.description?.trim() ||
                "Esta evaluación todavía no tiene una descripción."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {evaluation.durationMinutes}{" "}
                min
              </span>

              <span className="flex items-center gap-1">
                {evaluation.preview ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}

                {evaluation.preview
                  ? "Acceso previo permitido"
                  : "Solo estudiantes matriculados"}
              </span>
            </div>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          <Link
            href={`${contentHref}?evaluationId=${evaluation.id}`}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Gestionar
          </Link>
        </Button>
      </div>
    </article>
  );
}

interface EmptyCourseStructureProps {
  contentHref: string;
}

function EmptyCourseStructure({
  contentHref,
}: EmptyCourseStructureProps) {
  return (
    <Card>
      <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          El curso todavía no tiene semanas
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Primero crea la estructura del curso y
          luego agrega las evaluaciones dentro de
          la semana correspondiente.
        </p>

        <Button
          asChild
          className="mt-5"
        >
          <Link href={contentHref}>
            <Plus className="mr-2 h-4 w-4" />
            Administrar contenido
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}