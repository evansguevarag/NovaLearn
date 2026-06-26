"use client";

import {
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { uploadInstructorCourseThumbnail } from "@/features/instructor-courses/services/instructor-course.service";

interface InstructorCourseThumbnailUploaderProps {
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

export function InstructorCourseThumbnailUploader({
  courseId,
  currentThumbnailUrl,
  onUploaded,
}: InstructorCourseThumbnailUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [isUploading, setIsUploading] =
    useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelection(): void {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
      toast.error("Formato no permitido.", {
        description:
          "Selecciona una imagen JPG, PNG o WebP.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Imagen demasiado pesada.", {
        description:
          "El tamaño máximo permitido es de 5 MB.",
      });

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
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

      const response =
        await uploadInstructorCourseThumbnail(
          courseId,
          selectedFile
        );

      onUploaded(response.url);
      clearSelection();

      toast.success("Miniatura actualizada.");
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          "No se pudo subir la miniatura."
        )
      );
    } finally {
      setIsUploading(false);
    }
  }

  const displayedImage =
    previewUrl ?? currentThumbnailUrl;

  return (
    <div className="space-y-3">
      <div
        className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted/30 bg-cover bg-center"
        style={
          displayedImage
            ? {
                backgroundImage: `url(${JSON.stringify(
                  displayedImage
                )})`,
              }
            : undefined
        }
      >
        {!displayedImage && (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-8 w-8" />
            <p className="mt-2 text-xs">
              Sin miniatura
            </p>
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

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading}
        onClick={() =>
          inputRef.current?.click()
        }
      >
        <Upload className="mr-2 h-4 w-4" />
        Seleccionar imagen
      </Button>

      <Button
        type="button"
        className="w-full"
        disabled={!selectedFile || isUploading}
        onClick={() => void handleUpload()}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}

        Subir miniatura
      </Button>

      {selectedFile && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isUploading}
          onClick={clearSelection}
        >
          <X className="mr-2 h-4 w-4" />
          Quitar selección
        </Button>
      )}
    </div>
  );
}
