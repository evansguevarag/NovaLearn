"use client";

import {
  Award,
  ArrowLeft,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { CourseForm } from "@/features/admin-courses/components/course-form";
import { CourseThumbnailUploader } from "@/features/admin-courses/components/course-thumbnail-uploader";
import {
  getAdminCourseById,
  getCourseCategories,
  updateAdminCourse,
} from "@/features/admin-courses/services/admin-course.service";
import type {
  AdminCourse,
  AdminCourseRequest,
  CourseCategory,
} from "@/features/admin-courses/types/admin-course.types";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

interface EditCourseClientProps {
  courseId: number;
}

export function EditCourseClient({
  courseId,
}: EditCourseClientProps) {
  const router = useRouter();

  const { isChecking } =
    useAuthGuard(["ADMIN"]);

  const [course, setCourse] =
    useState<AdminCourse | null>(null);

  const [categories, setCategories] =
    useState<CourseCategory[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [formVersion, setFormVersion] =
    useState(0);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    async function loadCourseData():
      Promise<void> {
      try {
        setIsLoading(true);

        const [
          courseData,
          categoriesData,
        ] = await Promise.all([
          getAdminCourseById(courseId),
          getCourseCategories(),
        ]);

        if (isCancelled) {
          return;
        }

        setCourse(courseData);
        setCategories(categoriesData);
        setError(null);
      } catch (loadError: unknown) {
        if (isCancelled) {
          return;
        }

        setError(
          getApiErrorMessage(
            loadError,
            "No se pudo cargar la información del curso."
          )
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCourseData();

    return () => {
      isCancelled = true;
    };
  }, [courseId, isChecking]);

  async function handleUpdate(
    request: AdminCourseRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const updatedCourse =
        await updateAdminCourse(
          courseId,
          {
            ...request,
            thumbnailUrl:
              course?.thumbnailUrl ??
              request.thumbnailUrl,
          }
        );

      setCourse(updatedCourse);

      setFormVersion(
        (current) => current + 1
      );

      toast.success(
        "Curso actualizado correctamente.",
        {
          description:
            "Los cambios fueron guardados.",
          duration: 3500,
        }
      );

      router.refresh();
    } catch (updateError: unknown) {
      const message =
        getApiErrorMessage(
          updateError,
          "No se pudieron guardar los cambios del curso."
        );

      setError(message);

      toast.error(
        "No se pudo actualizar el curso.",
        {
          description: message,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleThumbnailUploaded(
    thumbnailUrl: string
  ): void {
    setCourse((currentCourse) => {
      if (!currentCourse) {
        return null;
      }

      return {
        ...currentCourse,
        thumbnailUrl,
      };
    });
  }

  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando curso...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No fue posible consultar el curso solicitado."
        actions={
          <Button
            asChild
            variant="outline"
          >
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Link>
          </Button>
        }
      >
        <Alert variant="destructive">
          <AlertTitle>
            Curso no encontrado
          </AlertTitle>

          <AlertDescription>
            {error ??
              "Verifica que el identificador del curso sea correcto."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  const initialValues:
    AdminCourseRequest = {
      instructorId:
        course.instructorId,
      categoryId:
        course.categoryId,
      title:
        course.title,
      shortDescription:
        course.shortDescription,
      description:
        course.description,
      requirements:
        course.requirements,
      targetAudience:
        course.targetAudience,
      thumbnailUrl:
        course.thumbnailUrl,
      price:
        course.price,
      courseType:
        course.courseType,
      status:
        course.status,
      level:
        course.level,
      certificateEnabled:
        course.certificateEnabled,
    };

  return (
    <DashboardShell
      title="Editar curso"
      description={`Administra la información de “${course.title}”.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
          >
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`/admin/courses/${course.id}/content`}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Administrar contenido
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
          >
            <Link
              href={`/admin/courses/${course.id}/certificate-template`}
            >
              <Award className="mr-2 h-4 w-4" />
              Plantilla de certificado
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

        <CourseForm
          key={`${course.id}-${formVersion}`}
          categories={categories}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
          thumbnailSection={
            <div className="space-y-3">
              <CourseThumbnailUploader
                courseId={course.id}
                currentThumbnailUrl={
                  course.thumbnailUrl
                }
                onUploaded={
                  handleThumbnailUploaded
                }
              />

              <div className="rounded-xl border p-4">
                <p className="font-medium">
                  Plantilla de certificado
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configura la imagen y la posición de
                  nombres, curso, fecha, código y QR en
                  una pantalla dedicada.
                </p>

                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                >
                  <Link
                    href={`/admin/courses/${course.id}/certificate-template`}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Configurar plantilla
                  </Link>
                </Button>
              </div>
            </div>
          }
          onSubmit={handleUpdate}
        />
      </div>
    </DashboardShell>
  );
}
