"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Loader2,
  UserRound,
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
} from "@/features/student-learning/types/student-learning.types";

interface StudentCourseOverviewClientProps {
  courseId: number;
}

export function StudentCourseOverviewClient({
  courseId,
}: StudentCourseOverviewClientProps) {
  const { isChecking } = useAuthGuard([
    "STUDENT",
  ]);

  const [course, setCourse] =
    useState<StudentLearningCourse | null>(
      null
    );

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

        const data =
          await getStudentLearningCourse(
            courseId
          );

        if (active) {
          setCourse(data);
        }
      } catch {
        if (active) {
          setError(
            "No se pudo cargar el resumen del curso."
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

  const totalDurationMinutes = useMemo(() => {
    if (!course) {
      return 0;
    }

    return course.modules
      .flatMap(
        (module) => module.lessons
      )
      .reduce(
        (total, lesson) =>
          total +
          Number(
            lesson.durationMinutes ?? 0
          ),
        0
      );
  }, [course]);

  if (isChecking || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando resumen...
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

              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {course.shortDescription ??
                  course.description ??
                  "Continúa desarrollando tus conocimientos con este curso."}
              </p>
            </div>

            <Card className="w-full shrink-0 lg:w-80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Progreso general
                  </span>

                  <span className="font-semibold">
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

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Layers3}
            label="Módulos"
            value={course.modules.length}
          />

          <StatCard
            icon={BookOpen}
            label="Lecciones"
            value={course.totalLessons}
          />

          <StatCard
            icon={CheckCircle2}
            label="Completadas"
            value={course.completedLessons}
          />

          <StatCard
            icon={Clock3}
            label="Duración estimada"
            value={formatDuration(
              totalDurationMinutes
            )}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle>
                Acerca del curso
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">
                {course.description ??
                  course.shortDescription ??
                  "Este curso todavía no tiene una descripción detallada."}
              </p>

              <Button
                asChild
                className="mt-6"
              >
                <Link
                  href={`/student/courses/${courseId}/learn`}
                >
                  {course.progressPercentage > 0
                    ? "Continuar aprendiendo"
                    : "Comenzar curso"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRound className="h-5 w-5" />
                  Instructor
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-medium">
                  {course.instructorName}
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Responsable del contenido y
                  acompañamiento académico del
                  curso.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Información académica
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoRow
                  label="Categoría"
                  value={course.categoryName}
                />

                <InfoRow
                  label="Nivel"
                  value={
                    course.level ??
                    "No especificado"
                  }
                />

                <InfoRow
                  label="Estado"
                  value={
                    course.completedAt
                      ? "Completado"
                      : "En progreso"
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string | number;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function formatDuration(
  totalMinutes: number
): string {
  if (totalMinutes <= 0) {
    return "0 min";
  }

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}