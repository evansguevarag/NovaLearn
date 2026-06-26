"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
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
import { getStudentLearningCourse } from "@/features/student-learning/services/student-learning.service";
import type {
  StudentLearningCourse,
  StudentLearningLesson,
} from "@/features/student-learning/types/student-learning.types";
import { markStudentLessonCompleted } from "@/features/student-progress/services/student-progress.service";

interface StudentLessonPageClientProps {
  courseId: number;
  lessonId: number;
}

export function StudentLessonPageClient({
  courseId,
  lessonId,
}: StudentLessonPageClientProps) {
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

  const [isCompleting, setIsCompleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [completionError, setCompletionError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let active = true;

    async function loadLesson(): Promise<void> {
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
          lessonData.lessonType !== "VIDEO" &&
          lessonData.lessonType !== "TEXT"
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
            "No se pudo cargar la lección solicitada."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadLesson();

    return () => {
      active = false;
    };
  }, [courseId, isChecking, lessonId]);

  const orderedLessons = useMemo(() => {
    if (!course) {
      return [];
    }

    return course.modules.flatMap(
      (module) => module.lessons
    );
  }, [course]);

  const currentLessonIndex =
    orderedLessons.findIndex(
      (currentLesson) =>
        currentLesson.id === lessonId
    );

  const previousLesson =
    currentLessonIndex > 0
      ? orderedLessons[
          currentLessonIndex - 1
        ]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex <
      orderedLessons.length - 1
      ? orderedLessons[
          currentLessonIndex + 1
        ]
      : null;

  async function handleComplete(): Promise<void> {
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
        "No se pudo actualizar el progreso de esta lección."
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
          Cargando lección...
        </div>
      </main>
    );
  }

  if (error || !course || !lesson) {
    return (
      <main className="min-h-screen bg-muted/20 p-6">
        <div className="mx-auto max-w-5xl">
          <Button
            asChild
            variant="outline"
            className="mb-6"
          >
            <Link
              href={`/student/courses/${courseId}/learn`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al contenido
            </Link>
          </Button>

          <Alert variant="destructive">
            <AlertTitle>
              Lección no disponible
            </AlertTitle>

            <AlertDescription>
              {error ??
                "No se encontró información de la lección."}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  const embedUrl =
    lesson.lessonType === "VIDEO"
      ? getVideoEmbedUrl(
          lesson.videoUrl
        )
      : null;

  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
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
                  {lesson.lessonType === "VIDEO"
                    ? "Video"
                    : "Texto"}
                </Badge>

                {lesson.completed ? (
                  <Badge>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Completada
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Pendiente
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

            <Card className="w-full shrink-0 lg:w-72">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Progreso del curso
                  </span>

                  <span className="font-semibold">
                    {course.progressPercentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
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

                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  {lesson.durationMinutes} minutos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              Contenido de la lección
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {lesson.lessonType === "VIDEO" && (
              <>
                {embedUrl ? (
                  <div className="mx-auto max-w-5xl">
                    <div className="aspect-video overflow-hidden rounded-xl border bg-black">
                      <iframe
                        src={embedUrl}
                        title={lesson.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : lesson.videoUrl ? (
                  <Alert>
                    <PlayCircle className="h-4 w-4" />

                    <AlertTitle>
                      Video externo
                    </AlertTitle>

                    <AlertDescription>
                      <a
                        href={normalizeExternalUrl(
                          lesson.videoUrl
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 flex w-fit items-center gap-2 font-medium text-primary hover:underline"
                      >
                        Abrir video
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTitle>
                      Video no disponible
                    </AlertTitle>

                    <AlertDescription>
                      Esta lección todavía no tiene
                      un video configurado.
                    </AlertDescription>
                  </Alert>
                )}

                {lesson.content && (
                  <div className="whitespace-pre-wrap text-sm leading-7 sm:text-base">
                    {lesson.content}
                  </div>
                )}
              </>
            )}

            {lesson.lessonType === "TEXT" &&
              (lesson.content ? (
                <article className="whitespace-pre-wrap text-sm leading-7 sm:text-base">
                  {lesson.content}
                </article>
              ) : (
                <Alert>
                  <FileText className="h-4 w-4" />

                  <AlertTitle>
                    Contenido no disponible
                  </AlertTitle>

                  <AlertDescription>
                    Esta lección todavía no tiene
                    contenido.
                  </AlertDescription>
                </Alert>
              ))}

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

            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {lesson.completed ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Lección completada
                  </div>
                ) : (
                  <Button
                    type="button"
                    disabled={isCompleting}
                    onClick={() => {
                      void handleComplete();
                    }}
                  >
                    {isCompleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}

                    Marcar como completada
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {previousLesson && (
                  <Button
                    asChild
                    variant="outline"
                  >
                    <Link
                      href={getLessonHref(
                        courseId,
                        previousLesson
                      )}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Link>
                  </Button>
                )}

                {nextLesson && (
                  <Button asChild>
                    <Link
                      href={getLessonHref(
                        courseId,
                        nextLesson
                      )}
                    >
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
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

function getVideoEmbedUrl(
  videoUrl: string | null
): string | null {
  if (!videoUrl?.trim()) {
    return null;
  }

  try {
    const normalizedUrl =
      normalizeExternalUrl(videoUrl);

    const url = new URL(normalizedUrl);
    const hostname =
      url.hostname
        .replace("www.", "")
        .toLowerCase();

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId =
        url.pathname
          .split("/")
          .filter(Boolean)[0] ?? null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      videoId =
        url.searchParams.get("v");

      if (!videoId) {
        const pathParts =
          url.pathname
            .split("/")
            .filter(Boolean);

        if (
          pathParts[0] === "embed" ||
          pathParts[0] === "shorts" ||
          pathParts[0] === "live"
        ) {
          videoId =
            pathParts[1] ?? null;
        }
      }
    }

    if (!videoId) {
      return null;
    }

    const cleanVideoId =
      videoId
        .split("?")[0]
        .split("&")[0]
        .trim();

    return cleanVideoId
      ? `https://www.youtube.com/embed/${cleanVideoId}`
      : null;
  } catch {
    return null;
  }
}

function normalizeExternalUrl(
  value: string
): string {
  const trimmedValue = value.trim();

  if (
    /^https?:\/\//i.test(trimmedValue)
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}