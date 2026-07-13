"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ListTree,
} from "lucide-react";
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
import { InstructorCourseThumbnailUploader } from "@/features/instructor-courses/components/instructor-course-thumbnail-uploader";
import { CertificateTemplateUploader } from "@/features/certificate-templates/components/certificate-template-uploader";
import {
  getInstructorCourseCertificateTemplate,
  updateInstructorCourseCertificateTemplateLayout,
  uploadInstructorCourseCertificateTemplate,
} from "@/features/certificate-templates/services/certificate-template.service";
import {
  getInstructorCourseById,
  getInstructorCourseCategories,
  updateInstructorCourse,
} from "@/features/instructor-courses/services/instructor-course.service";

import type {
  InstructorCourse,
  InstructorCourseCategory,
  InstructorCourseRequest,
} from "@/features/instructor-courses/types/instructor-course.types";
import type { CourseCertificateTemplate } from "@/features/certificate-templates/types/certificate-template.types";

interface EditInstructorCourseClientProps {
  courseId: number;
}

export function EditInstructorCourseClient({
  courseId,
}: EditInstructorCourseClientProps) {
  const { isChecking } =
    useAuthGuard(["INSTRUCTOR"]);

  const [course, setCourse] =
    useState<InstructorCourse | null>(null);
  const [categories, setCategories] =
    useState<InstructorCourseCategory[]>([]);
  const [certificateTemplate, setCertificateTemplate] =
    useState<CourseCertificateTemplate | null>(null);
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

    Promise.all([
      getInstructorCourseById(courseId),
      getInstructorCourseCategories(),
      getInstructorCourseCertificateTemplate(courseId)
        .catch(() => null),
    ])
      .then(([courseData, categoryData, templateData]) => {
        if (!isCancelled) {
          setCourse(courseData);
          setCategories(categoryData);
          setCertificateTemplate(templateData);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(
              error,
              "No se pudo cargar el curso."
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
  }, [courseId, isChecking]);

  async function handleUpdate(
    request: InstructorCourseRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const updatedCourse =
        await updateInstructorCourse(
          courseId,
          request
        );

      setCourse(updatedCourse);

      toast.success(
        "Curso actualizado correctamente."
      );
    } catch (error: unknown) {
      setError(
        getApiErrorMessage(
          error,
          "No se pudo actualizar el curso."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleThumbnailUploaded(
    thumbnailUrl: string
  ): void {
    setCourse((current) =>
      current
        ? {
            ...current,
            thumbnailUrl,
          }
        : current
    );
  }

  function handleTemplateUploaded(
    template: CourseCertificateTemplate
  ): void {
    setCertificateTemplate(template);
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Editar curso"
        description="Cargando información."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No se pudo cargar el curso solicitado."
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ??
              "El curso no existe o no tienes acceso."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  const initialValues: InstructorCourseRequest = {
    categoryId: course.categoryId,
    title: course.title,
    shortDescription:
      course.shortDescription ?? "",
    description: course.description ?? "",
    requirements: course.requirements ?? "",
    targetAudience:
      course.targetAudience ?? "",
    price: course.price,
    courseType: course.courseType,
    level: course.level ?? "BEGINNER",
    certificateEnabled:
      course.certificateEnabled,
  };

  return (
    <DashboardShell
      title="Editar curso"
      description={`Administra “${course.title}”.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/instructor/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`/instructor/courses/${course.id}/content`}
            >
              <ListTree className="mr-2 h-4 w-4" />
              Administrar contenido
            </Link>
          </Button>
        </div>
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
          key={course.updatedAt}
          categories={categories}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
          statusLabel={translateStatus(
            course.status
          )}
          thumbnailSection={
            <div className="space-y-4">
              <InstructorCourseThumbnailUploader
                courseId={course.id}
                currentThumbnailUrl={
                  course.thumbnailUrl
                }
                onUploaded={
                  handleThumbnailUploaded
                }
              />
              <CertificateTemplateUploader
                courseId={course.id}
                template={certificateTemplate}
                uploadTemplate={
                  uploadInstructorCourseCertificateTemplate
                }
                updateLayout={
                  updateInstructorCourseCertificateTemplateLayout
                }
                onUploaded={handleTemplateUploaded}
              />
            </div>
          }
          onSubmit={handleUpdate}
        />
      </div>
    </DashboardShell>
  );
}

function translateStatus(
  status: InstructorCourse["status"]
): string {
  const labels: Record<
    InstructorCourse["status"],
    string
  > = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ARCHIVED: "Archivado",
  };

  return labels[status];
}
