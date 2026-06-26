"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { InstructorCourseForm } from "@/features/instructor-courses/components/instructor-course-form";
import {
  createInstructorCourse,
  getInstructorCourseCategories,
} from "@/features/instructor-courses/services/instructor-course.service";

import type {
  InstructorCourseCategory,
  InstructorCourseRequest,
} from "@/features/instructor-courses/types/instructor-course.types";

export function CreateInstructorCourseClient() {
  const router = useRouter();
  const { isChecking } =
    useAuthGuard(["INSTRUCTOR"]);

  const [categories, setCategories] =
    useState<InstructorCourseCategory[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    getInstructorCourseCategories()
      .then((response) => {
        if (!isCancelled) {
          setCategories(response);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(
              error,
              "No se pudieron cargar las categorías."
            )
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isChecking]);

  async function handleCreate(
    request: InstructorCourseRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const course =
        await createInstructorCourse(request);

      toast.success("Curso creado correctamente.");

      router.push(
        `/instructor/courses/${course.id}`
      );
    } catch (error: unknown) {
      setError(
        getApiErrorMessage(
          error,
          "No se pudo crear el curso."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Crear curso"
        description="Preparando el formulario."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Crear nuevo curso"
      description="Registra la información académica de tu curso."
      actions={
        <Button asChild variant="outline">
          <Link href="/instructor/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cursos
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <InstructorCourseForm
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Crear curso"
          statusLabel="Borrador"
          onSubmit={handleCreate}
        />
      </div>
    </DashboardShell>
  );
}
