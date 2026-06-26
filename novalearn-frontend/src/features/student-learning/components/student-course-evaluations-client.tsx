"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ComponentType,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  History,
  Layers3,
  Loader2,
  PlayCircle,
  Trophy,
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
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { StudentCourseTabs } from "@/features/student-learning/components/student-course-tabs";
import { getStudentLearningCourse } from "@/features/student-learning/services/student-learning.service";
import type {
  StudentLearningCourse,
  StudentLearningLesson,
} from "@/features/student-learning/types/student-learning.types";
import { getStudentQuizAttempts } from "@/features/student-quiz/services/student-quiz.service";
import type {
  StudentQuizAttempt,
} from "@/features/student-quiz/types/student-quiz.types";

interface StudentCourseEvaluationsClientProps {
  courseId: number;
}

interface EvaluationItem {
  lesson: StudentLearningLesson;
  attempts: StudentQuizAttempt[];
}

interface EvaluationModule {
  moduleId: number;
  moduleTitle: string;
  moduleDescription: string | null;
  evaluations: EvaluationItem[];
}

export function StudentCourseEvaluationsClient({
  courseId,
}: StudentCourseEvaluationsClientProps) {
  const { isChecking } = useAuthGuard([
    "STUDENT",
  ]);

  const [course, setCourse] =
    useState<StudentLearningCourse | null>(
      null
    );

  const [evaluationModules, setEvaluationModules] =
    useState<EvaluationModule[]>([]);

  const [expandedModules, setExpandedModules] =
    useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let active = true;

    async function loadEvaluations(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const courseData =
          await getStudentLearningCourse(
            courseId
          );

        const modulesWithEvaluations =
          courseData.modules
            .map((module) => ({
              moduleId: module.id,
              moduleTitle: module.title,
              moduleDescription:
                module.description,
              lessons: module.lessons.filter(
                (lesson) =>
                  lesson.lessonType ===
                  "QUIZ"
              ),
            }))
            .filter(
              (module) =>
                module.lessons.length > 0
            );

        const loadedModules =
          await Promise.all(
            modulesWithEvaluations.map(
              async (
                module
              ): Promise<EvaluationModule> => {
                const evaluations =
                  await Promise.all(
                    module.lessons.map(
                      async (
                        lesson
                      ): Promise<EvaluationItem> => {
                        try {
                          const attempts =
                            await getStudentQuizAttempts(
                              lesson.id
                            );

                          return {
                            lesson,
                            attempts,
                          };
                        } catch {
                          return {
                            lesson,
                            attempts: [],
                          };
                        }
                      }
                    )
                  );

                return {
                  moduleId: module.moduleId,
                  moduleTitle:
                    module.moduleTitle,
                  moduleDescription:
                    module.moduleDescription,
                  evaluations,
                };
              }
            )
          );

        if (active) {
          setCourse(courseData);
          setEvaluationModules(
            loadedModules
          );
          setExpandedModules(new Set());
        }
      } catch {
        if (active) {
          setError(
            "No se pudieron cargar las evaluaciones del curso."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEvaluations();

    return () => {
      active = false;
    };
  }, [courseId, isChecking]);

  const allEvaluations = useMemo(
    () =>
      evaluationModules.flatMap(
        (module) => module.evaluations
      ),
    [evaluationModules]
  );

  const completedEvaluations = useMemo(
    () =>
      allEvaluations.filter(
        (evaluation) =>
          evaluation.lesson.completed
      ).length,
    [allEvaluations]
  );

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
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando evaluaciones...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>

          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="p-6">
        <Alert>
          <AlertTitle>
            Curso no disponible
          </AlertTitle>

          <AlertDescription>
            No se encontró información del curso.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Button
            asChild
            variant="ghost"
            className="-ml-3 mb-4"
          >
            <Link href="/student/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mis cursos
            </Link>
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {course.categoryName}
                </Badge>

                {course.level && (
                  <Badge variant="outline">
                    {course.level}
                  </Badge>
                )}

                {course.completedAt && (
                  <Badge>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Curso completado
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {course.courseTitle}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Consulta las evaluaciones
                organizadas según la semana o
                módulo al que pertenecen.
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Instructor: {course.instructorName}
              </p>
            </div>

            <Card className="w-full shrink-0 lg:w-80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Evaluaciones completadas
                  </span>

                  <span className="text-sm font-semibold">
                    {completedEvaluations} de{" "}
                    {allEvaluations.length}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${
                        allEvaluations.length > 0
                          ? (completedEvaluations /
                              allEvaluations.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Progreso general del curso:{" "}
                  {course.progressPercentage}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <StudentCourseTabs
        courseId={courseId}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {evaluationModules.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                No hay evaluaciones disponibles
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Este curso todavía no tiene
                cuestionarios publicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Evaluaciones por semana
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Despliega una semana para consultar
                sus evaluaciones.
              </p>
            </CardHeader>

            <CardContent className="p-0">
              {evaluationModules.map(
                (module) => (
                  <EvaluationModuleSection
                    key={module.moduleId}
                    courseId={courseId}
                    module={module}
                    expanded={expandedModules.has(
                      module.moduleId
                    )}
                    onToggle={() =>
                      toggleModule(
                        module.moduleId
                      )
                    }
                  />
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

interface EvaluationModuleSectionProps {
  courseId: number;
  module: EvaluationModule;
  expanded: boolean;
  onToggle: () => void;
}

function EvaluationModuleSection({
  courseId,
  module,
  expanded,
  onToggle,
}: EvaluationModuleSectionProps) {
  const completedCount =
    module.evaluations.filter(
      (evaluation) =>
        evaluation.lesson.completed
    ).length;

  const moduleCompleted =
    module.evaluations.length > 0 &&
    completedCount ===
      module.evaluations.length;

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
            <h2 className="font-semibold sm:text-lg">
              {module.moduleTitle}
            </h2>

            {moduleCompleted && (
              <Badge variant="secondary">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Completado
              </Badge>
            )}
          </div>

          {module.moduleDescription && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {module.moduleDescription}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {completedCount} de{" "}
            {module.evaluations.length}{" "}
            evaluaciones completadas
          </p>
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t bg-muted/10 p-4 sm:p-6">
          {module.evaluations.map(
            (evaluation, index) => (
              <EvaluationCard
                key={evaluation.lesson.id}
                courseId={courseId}
                evaluation={evaluation}
                evaluationNumber={index + 1}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

interface EvaluationCardProps {
  courseId: number;
  evaluation: EvaluationItem;
  evaluationNumber: number;
}

function EvaluationCard({
  courseId,
  evaluation,
  evaluationNumber,
}: EvaluationCardProps) {
  const completedAttempts =
    evaluation.attempts.filter(
      (attempt) => attempt.completed
    );

  const pendingAttempt =
    evaluation.attempts.find(
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

  const approved =
    completedAttempts.some(
      (attempt) => attempt.passed
    ) || evaluation.lesson.completed;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Evaluación {evaluationNumber}
              </p>

              <CardTitle className="mt-1 text-lg">
                {evaluation.lesson.title}
              </CardTitle>

              {evaluation.lesson.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {evaluation.lesson.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {approved ? (
              <Badge>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Aprobada
              </Badge>
            ) : pendingAttempt ? (
              <Badge variant="secondary">
                En progreso
              </Badge>
            ) : (
              <Badge variant="outline">
                Pendiente
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
          <EvaluationMetric
            icon={History}
            label="Intentos realizados"
            value={completedAttempts.length}
          />

          <EvaluationMetric
            icon={Trophy}
            label="Mejor calificación"
            value={
              bestScore !== null
                ? `${percentageToGrade20(
                    bestScore
                  )} / 20`
                : "Sin calificación"
            }
          />

          <EvaluationMetric
            icon={Clock3}
            label="Duración estimada"
            value={`${evaluation.lesson.durationMinutes} min`}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {approved
              ? "La evaluación fue aprobada. Puedes revisar tus resultados."
              : pendingAttempt
              ? "Tienes un intento pendiente de completar."
              : "Todavía no has iniciado esta evaluación."}
          </p>

          <Button
            asChild
            className="shrink-0"
          >
            <Link
              href={`/student/courses/${courseId}/lessons/${evaluation.lesson.id}/quiz`}
            >
              {approved
                ? "Ver resultados"
                : pendingAttempt
                ? "Continuar evaluación"
                : completedAttempts.length > 0
                ? "Nuevo intento"
                : "Iniciar evaluación"}

              <PlayCircle className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EvaluationMetricProps {
  icon: ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string | number;
}

function EvaluationMetric({
  icon: Icon,
  label,
  value,
}: EvaluationMetricProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function percentageToGrade20(
  percentage: number
): string {
  const grade =
    (percentage / 100) * 20;

  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(grade);
}