"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  PlayCircle,
  TrendingUp,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getStudentCourses } from "@/features/dashboard/services/student-dashboard.service";
import type {
  StudentCourse,
} from "@/features/dashboard/types/student-dashboard.types";

export function StudentCoursesClient() {
  const { isChecking } = useAuthGuard(["STUDENT"]);

  const [courses, setCourses] =
    useState<StudentCourse[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadCourses(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getStudentCourses();

        setCourses(data);
      } catch {
        setError(
          "No se pudieron cargar tus cursos."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCourses();
  }, [isChecking]);

  const stats = useMemo(
    () => buildCourseStats(courses),
    [courses]
  );

  if (isChecking) {
    return (
      <main className="p-8">
        Validando sesión...
      </main>
    );
  }

  return (
    <DashboardShell
      title="Mis cursos"
      description="Consulta tus cursos matriculados y continúa tu aprendizaje."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando cursos...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading &&
        !error &&
        courses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CourseMetricCard
              title="Progreso promedio"
              value={`${stats.averageProgress}%`}
              description="Promedio de tus cursos"
              icon={TrendingUp}
            />
            <CourseMetricCard
              title="En progreso"
              value={stats.inProgressCourses}
              description="Cursos iniciados"
              icon={Clock3}
            />
            <CourseMetricCard
              title="Completados"
              value={stats.completedCourses}
              description="Cursos finalizados"
              icon={CheckCircle2}
            />
            <CourseMetricCard
              title="Por iniciar"
              value={stats.pendingCourses}
              description="Cursos sin avance"
              icon={BookOpen}
            />
          </div>
        )}

      {!isLoading &&
        !error &&
        courses.length === 0 && (
          <Card>
            <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                No tienes cursos matriculados
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Cuando te matricules en un curso,
                aparecerá disponible en esta sección.
              </p>
            </CardContent>
          </Card>
        )}

      {!isLoading &&
        !error &&
        courses.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <StudentCourseCard
                key={course.enrollmentId}
                course={course}
              />
            ))}
          </div>
        )}
    </DashboardShell>
  );
}

function CourseMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function StudentCourseCard({
  course,
}: {
  course: StudentCourse;
}) {
  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(course.progressPercentage)
    )
  );

  const completed =
    course.completedAt !== null ||
    progress >= 100;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.courseTitle}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {course.categoryName}
          </Badge>

          {completed && (
            <Badge>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Completado
            </Badge>
          )}

          {!completed && progress > 0 && (
            <Badge variant="secondary">
              En progreso
            </Badge>
          )}

          {!completed && progress === 0 && (
            <Badge variant="outline">
              Por iniciar
            </Badge>
          )}
        </div>

        <CardTitle className="mt-3 line-clamp-2 text-lg">
          {course.courseTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Progreso
          </span>

          <span className="font-semibold">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Matriculado el{" "}
          {new Date(
            course.enrolledAt
          ).toLocaleDateString("es-PE")}
        </p>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button
          asChild
          className="w-full"
        >
          <Link
            href={`/student/courses/${course.courseId}/learn`}
          >
            <PlayCircle className="mr-2 h-4 w-4" />

            {completed
              ? "Ver curso"
              : progress > 0
              ? "Continuar curso"
              : "Comenzar curso"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function buildCourseStats(courses: StudentCourse[]) {
  const completedCourses = courses.filter(isCourseCompleted).length;
  const inProgressCourses = courses.filter(
    (course) =>
      !isCourseCompleted(course) && getCourseProgress(course) > 0
  ).length;
  const pendingCourses =
    courses.length - completedCourses - inProgressCourses;
  const averageProgress =
    courses.length === 0
      ? 0
      : courses.reduce(
          (total, course) => total + getCourseProgress(course),
          0
        ) / courses.length;

  return {
    completedCourses,
    inProgressCourses,
    pendingCourses,
    averageProgress: Math.round(averageProgress),
  };
}

function getCourseProgress(course: StudentCourse): number {
  return Math.min(
    100,
    Math.max(0, Math.round(Number(course.progressPercentage)))
  );
}

function isCourseCompleted(course: StudentCourse): boolean {
  return course.completedAt !== null || getCourseProgress(course) >= 100;
}
