"use client";

import {
  ExternalLink,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  deleteManagedLessonResource,
  uploadManagedLessonResource,
  type CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";
import type {
  InstructorLesson,
} from "@/features/instructor-content/types/instructor-content.types";

import { getApiErrorMessage } from "@/lib/get-api-error-message";

const MAX_PDF_SIZE =
  20 * 1024 * 1024;

interface LessonResourceUploaderProps {
  context: CourseContentContext;
  lesson: InstructorLesson;
  onLessonChange: (
    lesson: InstructorLesson
  ) => void;
}

export function LessonResourceUploader({
  context,
  lesson,
  onLessonChange,
}: LessonResourceUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError =
      validatePdf(file);

    if (validationError) {
      toast.error(validationError);

      event.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload():
    Promise<void> {
    if (!selectedFile) {
      toast.error(
        "Selecciona un archivo PDF."
      );

      return;
    }

    try {
      setIsUploading(true);

      const updatedLesson =
        await uploadManagedLessonResource(
          context,
          lesson.id,
          selectedFile
        );

      onLessonChange(updatedLesson);

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      toast.success(
        Boolean(lesson.resourceUrl)
          ? "PDF reemplazado correctamente."
          : "PDF subido correctamente."
      );
    } catch (uploadError: unknown) {
      toast.error(
        getApiErrorMessage(
          uploadError,
          "No se pudo subir el archivo PDF."
        )
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete():
    Promise<void> {
    try {
      setIsDeleting(true);

      const updatedLesson =
        await deleteManagedLessonResource(
          context,
          lesson.id
        );

      onLessonChange(updatedLesson);

      toast.success(
        "PDF eliminado correctamente."
      );
    } catch (deleteError: unknown) {
      toast.error(
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar el archivo PDF."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const isBusy =
    isUploading || isDeleting;

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold">
          Material PDF
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Adjunta un documento PDF de hasta 20 MB.
        </p>
      </div>

      {lesson.resourceUrl ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {lesson.resourceFileName ??
                  "recurso.pdf"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>Documento PDF</span>

                <span aria-hidden="true">
                  ·
                </span>

                <span>
                  {formatFileSize(
                    lesson.resourceFileSize
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              type="button"
              size="sm"
              variant="outline"
            >
              <a
                href={lesson.resourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 size-4" />
                Abrir PDF
              </a>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={isBusy}
              onClick={() => {
                void handleDelete();
              }}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}

              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            No hay un PDF adjunto
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Selecciona un archivo para añadirlo a la lección.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          disabled={isBusy}
          onChange={handleFileChange}
        />

        {selectedFile && (
          <div className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Archivo seleccionado:{" "}
            <span className="font-medium text-foreground">
              {selectedFile.name}
            </span>{" "}
            ({formatFileSize(selectedFile.size)})
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          disabled={
            !selectedFile || isBusy
          }
          onClick={() => {
            void handleUpload();
          }}
        >
          {isUploading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Upload className="mr-2 size-4" />
          )}

          {Boolean(lesson.resourceUrl)
            ? "Reemplazar PDF"
            : "Subir PDF"}
        </Button>
      </div>
    </section>
  );
}

function validatePdf(
  file: File
): string | null {
  const hasPdfMimeType =
    file.type === "application/pdf";

  const hasPdfExtension =
    file.name
      .toLowerCase()
      .endsWith(".pdf");

  if (
    !hasPdfMimeType ||
    !hasPdfExtension
  ) {
    return "Solo se permiten archivos PDF.";
  }

  if (file.size > MAX_PDF_SIZE) {
    return "El archivo PDF no debe superar los 20 MB.";
  }

  return null;
}

function formatFileSize(
  size: number | null
): string {
  if (
    size === null ||
    !Number.isFinite(size) ||
    size < 0
  ) {
    return "Tamaño no disponible";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes =
    size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes =
    kilobytes / 1024;

  return `${megabytes.toFixed(1)} MB`;
}