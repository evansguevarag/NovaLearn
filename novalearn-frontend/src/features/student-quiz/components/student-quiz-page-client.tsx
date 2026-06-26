"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getStudentLearningCourse } from "@/features/student-learning/services/student-learning.service";
import type {
  StudentLearningCourse,
  StudentLearningLesson,
} from "@/features/student-learning/types/student-learning.types";
import { StudentQuizPlayer } from "@/features/student-quiz/components/student-quiz-player";
import { markStudentLessonCompleted } from "@/features/student-progress/services/student-progress.service";

interface StudentQuizPageClientProps {
  courseId: number;
  lessonId: number;
}

export function StudentQuizPageClient({
  courseId,
  lessonId,
}: StudentQuizPageClientProps) {
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

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let active = true;

    async function loadQuizPage(): Promise<void> {
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
          lessonData.lessonType !== "QUIZ"
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
            "No se pudo cargar el cuestionario solicitado."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadQuizPage();

    return () => {
      active = false;
    };
  }, [courseId, isChecking, lessonId]);

  async function refreshCourseProgress(): Promise<void> {
    try {
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

      setCourse(courseData);

      if (lessonData) {
        setLesson(lessonData);
      }
    } catch {
      // El intento ya fue guardado.
    }
  }

  async function handleQuizPassed(): Promise<void> {
    if (!course || !lesson) {
      return;
    }

    try {
      await markStudentLessonCompleted(
        course.enrollmentId,
        lesson.id
      );

      setLesson((currentLesson) =>
        currentLesson
          ? {
              ...currentLesson,
              completed: true,
            }
          : currentLesson
      );

      await refreshCourseProgress();
    } catch {
      setError(
        "El cuestionario fue aprobado, pero no se pudo actualizar el progreso del curso."
      );
    }
  }

  if (isChecking || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando cuestionario...
        </div>
      </main>
    );
  }

  if (error || !course || !lesson) {
    return (
      <main className="min-h-screen bg-muted/20 p-6">
        <div className="mx-auto max-w-4xl">
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
              Cuestionario no disponible
            </AlertTitle>

            <AlertDescription>
              {error ??
                "No se encontró información del cuestionario."}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {course.categoryName}
                </Badge>

                <Badge variant="outline">
                  Evaluación
                </Badge>

                {lesson.completed && (
                  <Badge>
                    Completada
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

            <Card className="shrink-0">
              <CardContent className="flex items-center gap-3 p-4">
                <ClipboardCheck className="h-8 w-8 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Progreso del curso
                  </p>

                  <p className="text-lg font-bold">
                    {course.progressPercentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <StudentQuizPlayer
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onPassed={() => {
            void handleQuizPassed();
          }}
        />
      </div>
    </main>
  );
}