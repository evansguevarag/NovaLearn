"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadCourseThumbnail } from "@/features/admin-courses/services/admin-course.service";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

interface CourseThumbnailUploaderProps {
  courseId: number;
  currentThumbnailUrl: string | null;
  onUploaded: (thumbnailUrl: string) => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CourseThumbnailUploader({
  courseId,
  currentThumbnailUrl,
  onUploaded,
}: CourseThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetInput(): void {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato de imagen no permitido.", {
        description:
          "Selecciona una imagen JPG, PNG o WebP.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("La imagen es demasiado pesada.", {
        description:
          "El tamaño máximo permitido es de 5 MB.",
      });

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload(): Promise<void> {
    if (!selectedFile) {
      return;
    }

    try {
      setIsUploading(true);

      const result = await uploadCourseThumbnail(
        courseId,
        selectedFile
      );

      onUploaded(result.url);
      resetInput();

      toast.success("Miniatura actualizada.", {
        description:
          "La imagen fue guardada correctamente en Cloudinary.",
        duration: 3500,
      });
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "No se pudo subir la miniatura del curso."
      );

      toast.error("Error al subir la miniatura.", {
        description: message,
      });
    } finally {
      setIsUploading(false);
    }
  }

  const displayedImage =
    previewUrl ?? currentThumbnailUrl;

  return (
    <div className="space-y-3">
      <div
        className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/30 bg-cover bg-center bg-no-repeat"
        style={
          displayedImage
            ? {
                backgroundImage: `url(${JSON.stringify(
                  displayedImage
                )})`,
              }
            : undefined
        }
        role={displayedImage ? "img" : undefined}
        aria-label={
          displayedImage
            ? "Vista previa de la miniatura del curso"
            : undefined
        }
      >
        {!displayedImage && (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />

            <div>
              <p className="text-sm font-medium">
                Sin miniatura
              </p>

              <p className="mt-1 text-xs">
                JPG, PNG o WebP
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />

          {currentThumbnailUrl
            ? "Seleccionar reemplazo"
            : "Seleccionar imagen"}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!selectedFile || isUploading}
          onClick={() => void handleUpload()}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}

          {isUploading
            ? "Subiendo imagen..."
            : "Subir miniatura"}
        </Button>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3">
          <div className="min-w-0">
            <p
              className="truncate text-xs font-medium"
              title={selectedFile.name}
            >
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isUploading}
            aria-label="Cancelar selección"
            onClick={resetInput}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Máximo 5 MB. Formatos JPG, PNG o WebP.
        Proporción recomendada: 16:9.
      </p>
    </div>
  );
}

function formatFileSize(size: number): string {
  const megabytes = size / (1024 * 1024);

  return `${megabytes.toFixed(2)} MB`;
}
