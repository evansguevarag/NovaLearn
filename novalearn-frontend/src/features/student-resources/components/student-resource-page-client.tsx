"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
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
import { getStudentLearningCourse } from "@/features/student-learning/services/student-learning.service";
import { markStudentLessonCompleted } from "@/features/student-progress/services/student-progress.service";
import type {
  StudentLearningCourse,
  StudentLearningLesson,
} from "@/features/student-learning/types/student-learning.types";

interface StudentResourcePageClientProps {
  courseId: number;
  lessonId: number;
}

export function StudentResourcePageClient({
  courseId,
  lessonId,
}: StudentResourcePageClientProps) {
  const { isChecking } = useAuthGuard([
    "STUDENT",
  ]);

  const [course, setCourse] =
    useState<StudentLearningCourse | null>(
      null
    );

  const [lesson, setLesson] =
    useState<StudentLearningLesson | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isCompleting, setIsCompleting] =
    useState(false);

  const [completionError, setCompletionError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let active = true;

    async function loadResource(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const courseData =
          await getStudentLearningCourse(
            courseId
          );

        const lessonData =
          courseData.modules
            .flatMap(
              (module) => module.lessons
            )
            .find(
              (currentLesson) =>
                currentLesson.id === lessonId
            ) ?? null;

        if (!lessonData) {
          throw new Error(
            "LESSON_NOT_FOUND"
          );
        }

        if (
          lessonData.lessonType !==
          "RESOURCE"
        ) {
          throw new Error(
            "INVALID_LESSON_TYPE"
          );
        }

        if (active) {
          setCourse(courseData);
          setLesson(lessonData);
        }
      } catch {
        if (active) {
          setError(
            "No se pudo cargar el recurso solicitado."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      active = false;
    };
  }, [courseId, isChecking, lessonId]);

  const canPreview = useMemo(() => {
    if (!lesson?.resourceUrl) {
      return false;
    }

    const mimeType =
      lesson.resourceMimeType
        ?.toLowerCase()
        .trim() ?? "";

    const fileName =
      lesson.resourceFileName
        ?.toLowerCase()
        .trim() ?? "";

    return (
      mimeType.includes("pdf") ||
      fileName.endsWith(".pdf")
    );
  }, [lesson]);

  async function handleCompleteResource(): Promise<void> {
    if (!course || !lesson || lesson.completed) {
      return;
    }

    try {
      setIsCompleting(true);
      setCompletionError(null);

      await markStudentLessonCompleted(
        course.enrollmentId,
        lesson.id
      );

      const updatedCourse =
        await getStudentLearningCourse(
          courseId
        );

      const updatedLesson =
        updatedCourse.modules
          .flatMap(
            (module) => module.lessons
          )
          .find(
            (currentLesson) =>
              currentLesson.id === lessonId
          ) ?? null;

      setCourse(updatedCourse);

      if (updatedLesson) {
        setLesson(updatedLesson);
      }
    } catch {
      setCompletionError(
        "No se pudo actualizar el progreso de este recurso."
      );
    } finally {
      setIsCompleting(false);
    }
  }

  if (isChecking || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando recurso...
        </div>
      </main>
    );
  }

  if (error || !course || !lesson) {
    return (
      <main className="min-h-screen bg-muted/20 p-6">
        <div className="mx-auto max-w-6xl">
          <Button
            asChild
            variant="outline"
            className="mb-6"
          >
            <Link
              href={`/student/courses/${courseId}/learn`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al curso
            </Link>
          </Button>

          <Alert variant="destructive">
            <AlertTitle>
              Recurso no disponible
            </AlertTitle>

            <AlertDescription>
              {error ??
                "No se encontró información del recurso."}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <Button
            asChild
            variant="ghost"
            className="-ml-3 mb-4"
          >
            <Link
              href={`/student/courses/${courseId}/learn`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al contenido
            </Link>
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {course.categoryName}
                </Badge>

                <Badge variant="outline">
                  Recurso
                </Badge>

                {lesson.completed && (
                  <Badge>
                    Completado
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {lesson.title}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {course.courseTitle}
              </p>

              {lesson.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {lesson.description}
                </p>
              )}
            </div>

            {lesson.resourceUrl && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                >
                  <a
                    href={lesson.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir en otra pestaña
                  </a>
                </Button>

                <Button asChild>
                  <a
                    href={lesson.resourceUrl}
                    download={
                      lesson.resourceFileName ??
                      undefined
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!lesson.resourceUrl ? (
          <Alert>
            <FileText className="h-4 w-4" />

            <AlertTitle>
              Archivo no disponible
            </AlertTitle>

            <AlertDescription>
              Esta lección todavía no tiene un
              archivo adjunto.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-base">
                  Vista del recurso
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {canPreview ? (
                  <iframe
                    src={lesson.resourceUrl}
                    title={
                      lesson.resourceFileName ??
                      lesson.title
                    }
                    className="h-[75vh] min-h-[600px] w-full border-0"
                  />
                ) : (
                  <div className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
                    <FileText className="h-16 w-16 text-primary" />

                    <h2 className="mt-5 text-xl font-semibold">
                      Vista previa no disponible
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Este tipo de archivo no puede
                      mostrarse directamente dentro
                      del navegador. Puedes abrirlo
                      en otra pestaña o descargarlo.
                    </p>

                    <Button
                      asChild
                      className="mt-6"
                    >
                      <a
                        href={lesson.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir recurso
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <aside>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Información del archivo
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Nombre
                    </p>

                    <p className="mt-1 break-words text-sm font-medium">
                      {lesson.resourceFileName ??
                        "Recurso de la lección"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tipo
                    </p>

                    <p className="mt-1 text-sm">
                      {lesson.resourceMimeType ??
                        "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Lección
                    </p>

                    <p className="mt-1 text-sm">
                      {lesson.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Estado
                    </p>

                    {lesson.completed ? (
                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Completado
                      </p>
                    ) : (
                      <p className="mt-1 text-sm">
                        Pendiente
                      </p>
                    )}
                  </div>

                  {completionError && (
                    <Alert variant="destructive">
                      <AlertTitle>
                        No se actualizó el progreso
                      </AlertTitle>

                      <AlertDescription>
                        {completionError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {!lesson.completed && (
                    <Button
                      type="button"
                      className="w-full"
                      disabled={isCompleting}
                      onClick={() => {
                        void handleCompleteResource();
                      }}
                    >
                      {isCompleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}

                      Marcar como completado
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href={`/student/courses/${courseId}/learn`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver al curso
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}