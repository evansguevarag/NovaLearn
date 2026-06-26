"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  HelpCircle,
  Loader2,
  PlayCircle,
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
import { StudentModuleEvaluations } from "@/features/student-evaluations/components/student-module-evaluations";
import { getStudentCourseEvaluations } from "@/features/student-evaluations/services/student-evaluation.service";
import { getStudentLearningCourse } from "@/features/student-learning/services/student-learning.service";
import type {
  StudentLearningCourse,
  StudentLearningLesson,
  StudentLearningModule,
} from "@/features/student-learning/types/student-learning.types";
import type {
  Evaluation,
} from "@/features/evaluations/types/evaluation.types";

interface StudentLearningClassroomProps {
  courseId: number;
}

export function StudentLearningClassroom({
  courseId,
}: StudentLearningClassroomProps) {
  const { isChecking } = useAuthGuard([
    "STUDENT",
  ]);

  const [course, setCourse] =
    useState<StudentLearningCourse | null>(
      null
    );

  const [evaluations, setEvaluations] =
    useState<Evaluation[]>([]);

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

    async function loadCourse(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const [
          courseData,
          evaluationData,
        ] = await Promise.all([
          getStudentLearningCourse(
            courseId
          ),
          getStudentCourseEvaluations(
            courseId
          ),
        ]);

        if (active) {
          setCourse(courseData);
          setEvaluations(evaluationData);
          setExpandedModules(new Set());
        }
      } catch {
        if (active) {
          setError(
            "No se pudo cargar el contenido del curso."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      active = false;
    };
  }, [courseId, isChecking]);

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
          Cargando contenido...
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
              <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
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
                {course.shortDescription ??
                  course.description ??
                  "Continúa avanzando en el contenido del curso."}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Instructor: {course.instructorName}
              </p>
            </div>

            <Card className="w-full shrink-0 lg:w-80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Progreso del curso
                  </span>

                  <span className="text-sm font-semibold">
                    {course.progressPercentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          course.progressPercentage
                        )
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {course.completedLessons} de{" "}
                  {course.totalLessons} lecciones
                  completadas
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
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Contenido del curso
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Despliega un módulo y selecciona una
              lección para abrir su contenido.
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {course.modules.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />

                <h2 className="mt-4 font-semibold">
                  Sin contenido disponible
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Este curso todavía no tiene
                  módulos publicados.
                </p>
              </div>
            ) : (
              <div>
                {course.modules.map((module) => (
                  <CourseModule
                    key={module.id}
                    courseId={courseId}
                    module={module}
                    evaluations={evaluations.filter(
                      (evaluation) =>
                        evaluation.moduleId ===
                        module.id
                    )}
                    expanded={expandedModules.has(
                      module.id
                    )}
                    onToggle={() =>
                      toggleModule(module.id)
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

interface CourseModuleProps {
  courseId: number;
  module: StudentLearningModule;
  evaluations: Evaluation[];
  expanded: boolean;
  onToggle: () => void;
}

function CourseModule({
  courseId,
  module,
  evaluations,
  expanded,
  onToggle,
}: CourseModuleProps) {
  const completedLessons =
    module.lessons.filter(
      (lesson) => lesson.completed
    ).length;

  const moduleCompleted =
    module.lessons.length > 0 &&
    completedLessons === module.lessons.length;

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

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold sm:text-lg">
              {module.title}
            </h2>

            {moduleCompleted && (
              <Badge variant="secondary">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Completado
              </Badge>
            )}
          </div>

          {module.description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {module.description}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {completedLessons} de{" "}
            {module.lessons.length} lecciones
            completadas
          </p>
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-muted/10 px-4 py-3 sm:px-6">
          {module.lessons.length === 0 ? (
            <p className="py-5 text-sm text-muted-foreground">
              Este módulo no tiene lecciones
              disponibles.
            </p>
          ) : (
            <div className="divide-y rounded-lg border bg-background">
              {module.lessons.map(
                (lesson, index) => (
                  <LessonRow
                    key={lesson.id}
                    courseId={courseId}
                    lesson={lesson}
                    lessonNumber={index + 1}
                  />
                )
              )}
            </div>
          )}

          <StudentModuleEvaluations
            evaluations={evaluations}
          />
        </div>
      )}
    </section>
  );
}

interface LessonRowProps {
  courseId: number;
  lesson: StudentLearningLesson;
  lessonNumber: number;
}

function LessonRow({
  courseId,
  lesson,
  lessonNumber,
}: LessonRowProps) {
  return (
    <Link
      href={getLessonHref(
        courseId,
        lesson
      )}
      className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="mt-0.5">
        {lesson.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lección {lessonNumber}
            </p>

            <h3 className="mt-1 font-medium transition-colors group-hover:text-primary">
              {lesson.title}
            </h3>

            {lesson.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {lesson.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge variant="outline">
              <LessonTypeIcon
                type={lesson.lessonType}
              />

              <span className="ml-1">
                {getLessonTypeLabel(
                  lesson.lessonType
                )}
              </span>
            </Badge>

            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {lesson.durationMinutes} min
            </span>
          </div>
        </div>
      </div>

      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

function LessonTypeIcon({
  type,
}: {
  type: StudentLearningLesson["lessonType"];
}) {
  if (type === "VIDEO") {
    return (
      <PlayCircle className="h-3.5 w-3.5" />
    );
  }

  if (type === "QUIZ") {
    return (
      <HelpCircle className="h-3.5 w-3.5" />
    );
  }

  return (
    <FileText className="h-3.5 w-3.5" />
  );
}

function getLessonTypeLabel(
  type: StudentLearningLesson["lessonType"]
): string {
  const labels: Record<
    StudentLearningLesson["lessonType"],
    string
  > = {
    VIDEO: "Video",
    TEXT: "Texto",
    RESOURCE: "Recurso",
    QUIZ: "Cuestionario",
  };

  return labels[type];
}

function getLessonHref(
  courseId: number,
  lesson: StudentLearningLesson
): string {
  if (lesson.lessonType === "QUIZ") {
    return `/student/courses/${courseId}/lessons/${lesson.id}/quiz`;
  }

  if (lesson.lessonType === "RESOURCE") {
    return `/student/courses/${courseId}/lessons/${lesson.id}/resource`;
  }

  return `/student/courses/${courseId}/lessons/${lesson.id}`;
}