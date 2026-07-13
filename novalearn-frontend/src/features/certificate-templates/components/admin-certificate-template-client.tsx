"use client";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getAdminCourseById } from "@/features/admin-courses/services/admin-course.service";
import type { AdminCourse } from "@/features/admin-courses/types/admin-course.types";
import { CertificateTemplateUploader } from "@/features/certificate-templates/components/certificate-template-uploader";
import {
  getAdminCourseCertificateTemplate,
  updateAdminCourseCertificateTemplateLayout,
  uploadAdminCourseCertificateTemplate,
} from "@/features/certificate-templates/services/certificate-template.service";
import type { CourseCertificateTemplate } from "@/features/certificate-templates/types/certificate-template.types";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

interface AdminCertificateTemplateClientProps {
  courseId: number;
}

export function AdminCertificateTemplateClient({
  courseId,
}: AdminCertificateTemplateClientProps) {
  const { isChecking } =
    useAuthGuard(["ADMIN"]);

  const [course, setCourse] =
    useState<AdminCourse | null>(null);
  const [template, setTemplate] =
    useState<CourseCertificateTemplate | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    async function loadTemplateData():
      Promise<void> {
      try {
        setIsLoading(true);

        const [
          courseData,
          templateData,
        ] = await Promise.all([
          getAdminCourseById(courseId),
          getAdminCourseCertificateTemplate(courseId)
            .catch(() => null),
        ]);

        if (isCancelled) {
          return;
        }

        setCourse(courseData);
        setTemplate(templateData);
        setError(null);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setError(
          getApiErrorMessage(
            loadError,
            "No se pudo cargar la plantilla del curso."
          )
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTemplateData();

    return () => {
      isCancelled = true;
    };
  }, [courseId, isChecking]);

  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando plantilla...
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      title="Plantilla de certificado"
      description={
        course
          ? `Configura el certificado de “${course.title}”.`
          : "Configura la imagen y campos del certificado."
      }
      actions={
        <Button
          asChild
          variant="outline"
        >
          <Link href={`/admin/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-5xl space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <CertificateTemplateUploader
          courseId={courseId}
          template={template}
          uploadTemplate={
            uploadAdminCourseCertificateTemplate
          }
          updateLayout={
            updateAdminCourseCertificateTemplateLayout
          }
          onUploaded={setTemplate}
        />
      </div>
    </DashboardShell>
  );
}
