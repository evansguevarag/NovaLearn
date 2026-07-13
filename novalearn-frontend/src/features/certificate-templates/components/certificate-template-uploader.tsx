"use client";

import {
  FileImage,
  Loader2,
  QrCode,
  Save,
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
import type {
  CourseCertificateTemplate,
  UpdateCourseCertificateTemplateLayoutRequest,
} from "@/features/certificate-templates/types/certificate-template.types";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

interface CertificateTemplateUploaderProps {
  courseId: number;
  template: CourseCertificateTemplate | null;
  uploadTemplate: (
    courseId: number,
    file: File
  ) => Promise<CourseCertificateTemplate>;
  updateLayout: (
    courseId: number,
    request: UpdateCourseCertificateTemplateLayoutRequest
  ) => Promise<CourseCertificateTemplate>;
  onUploaded: (
    template: CourseCertificateTemplate
  ) => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CertificateTemplateUploader(
  props: CertificateTemplateUploaderProps
) {
  return (
    <CertificateTemplateUploaderContent
      key={props.template?.id ?? "empty-template"}
      {...props}
    />
  );
}

function CertificateTemplateUploaderContent({
  courseId,
  template,
  uploadTemplate,
  updateLayout,
  onUploaded,
}: CertificateTemplateUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);
  const previewRef =
    useRef<HTMLDivElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [isUploading, setIsUploading] =
    useState(false);
  const [isSavingLayout, setIsSavingLayout] =
    useState(false);
  const [layout, setLayout] =
    useState<UpdateCourseCertificateTemplateLayoutRequest>(
      toLayout(template)
    );

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
      toast.error("Formato de plantilla no permitido.", {
        description:
          "Selecciona una imagen JPG, PNG o WebP.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("La plantilla es demasiado pesada.", {
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

      const uploadedTemplate =
        await uploadTemplate(courseId, selectedFile);

      onUploaded(uploadedTemplate);
      resetInput();

      toast.success("Plantilla actualizada.", {
        description:
          "Los certificados usarán este diseño.",
      });
    } catch (error: unknown) {
      toast.error("No se pudo subir la plantilla.", {
        description: getApiErrorMessage(
          error,
          "Intenta nuevamente con otra imagen."
        ),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveLayout(): Promise<void> {
    if (!template) {
      return;
    }

    try {
      setIsSavingLayout(true);

      const updatedTemplate =
        await updateLayout(courseId, layout);

      onUploaded(updatedTemplate);

      toast.success("Diseño guardado.", {
        description:
          "Las próximas descargas usarán estas posiciones.",
      });
    } catch (error: unknown) {
      toast.error("No se pudo guardar el diseño.", {
        description: getApiErrorMessage(
          error,
          "Revisa las posiciones e intenta nuevamente."
        ),
      });
    } finally {
      setIsSavingLayout(false);
    }
  }

  function moveField(
    field: LayoutField,
    clientX: number,
    clientY: number
  ): void {
    const container =
      previewRef.current?.getBoundingClientRect();

    if (!container) {
      return;
    }

    const x = clamp(
      ((clientX - container.left) / container.width) *
        100
    );
    const y = clamp(
      ((clientY - container.top) / container.height) *
        100
    );

    setLayout((current) => ({
      ...current,
      [`${field}X`]: roundPercent(x),
      [`${field}Y`]: roundPercent(y),
    }));
  }

  const displayedImage =
    previewUrl ?? template?.templateUrl ?? null;

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div>
        <p className="font-medium">
          Plantilla de certificado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          El PDF colocará nombre, curso, fecha, código y QR sobre esta imagen.
        </p>
      </div>

      <div
        ref={previewRef}
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/30 bg-cover bg-center bg-no-repeat"
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
          <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
            <FileImage className="h-8 w-8" />
            <p className="text-sm font-medium">
              Sin plantilla
            </p>
          </div>
        )}

        {displayedImage && (
          <>
            <DraggableField
              label="Nombre del estudiante"
              field="studentName"
              x={layout.studentNameX}
              y={layout.studentNameY}
              onMove={moveField}
              className="text-sm font-semibold"
            />
            <DraggableField
              label="Nombre del curso"
              field="courseTitle"
              x={layout.courseTitleX}
              y={layout.courseTitleY}
              onMove={moveField}
            />
            <DraggableField
              label="Fecha"
              field="issuedAt"
              x={layout.issuedAtX}
              y={layout.issuedAtY}
              onMove={moveField}
            />
            <DraggableField
              label="Código"
              field="certificateCode"
              x={layout.certificateCodeX}
              y={layout.certificateCodeY}
              onMove={moveField}
            />
            <button
              type="button"
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-move rounded bg-background/85 p-2 shadow-sm ring-1 ring-border"
              style={{
                left: `${layout.qrX}%`,
                top: `${layout.qrY}%`,
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(
                  event.pointerId
                );
                moveField(
                  "qr",
                  event.clientX,
                  event.clientY
                );
              }}
              onPointerMove={(event) => {
                if (
                  event.currentTarget.hasPointerCapture(
                    event.pointerId
                  )
                ) {
                  moveField(
                    "qr",
                    event.clientX,
                    event.clientY
                  );
                }
              }}
            >
              <QrCode className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {template
            ? "Seleccionar reemplazo"
            : "Seleccionar plantilla"}
        </Button>

        <Button
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={() => void handleUpload()}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? "Subiendo..." : "Guardar plantilla"}
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

      {template && (
        <div className="grid gap-3 rounded-lg border bg-muted/15 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              Posiciones del certificado
            </p>
            <input
              type="color"
              value={layout.primaryTextColor}
              className="h-8 w-12 rounded border bg-background"
              aria-label="Color de texto"
              onChange={(event) =>
                setLayout((current) => ({
                  ...current,
                  primaryTextColor:
                    event.target.value,
                }))
              }
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Arrastra cada campo sobre la plantilla y guarda el diseño.
          </p>

          <Button
            type="button"
            disabled={isSavingLayout}
            onClick={() => void handleSaveLayout()}
          >
            {isSavingLayout ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar diseño
          </Button>
        </div>
      )}
    </div>
  );
}

function formatFileSize(size: number): string {
  const megabytes = size / (1024 * 1024);

  return `${megabytes.toFixed(2)} MB`;
}

type LayoutField =
  | "studentName"
  | "courseTitle"
  | "issuedAt"
  | "certificateCode"
  | "qr";

interface DraggableFieldProps {
  label: string;
  field: LayoutField;
  x: number;
  y: number;
  className?: string;
  onMove: (
    field: LayoutField,
    clientX: number,
    clientY: number
  ) => void;
}

function DraggableField({
  label,
  field,
  x,
  y,
  className,
  onMove,
}: DraggableFieldProps) {
  return (
    <button
      type="button"
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-move rounded bg-background/85 px-3 py-1 text-xs shadow-sm ring-1 ring-border ${
        className ?? ""
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
        onMove(field, event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (
          event.currentTarget.hasPointerCapture(
            event.pointerId
          )
        ) {
          onMove(
            field,
            event.clientX,
            event.clientY
          );
        }
      }}
    >
      {label}
    </button>
  );
}

function toLayout(
  template: CourseCertificateTemplate | null
): UpdateCourseCertificateTemplateLayoutRequest {
  return {
    studentNameX: template?.studentNameX ?? 50,
    studentNameY: template?.studentNameY ?? 48,
    courseTitleX: template?.courseTitleX ?? 50,
    courseTitleY: template?.courseTitleY ?? 36,
    issuedAtX: template?.issuedAtX ?? 50,
    issuedAtY: template?.issuedAtY ?? 26,
    certificateCodeX:
      template?.certificateCodeX ?? 50,
    certificateCodeY:
      template?.certificateCodeY ?? 13,
    qrX: template?.qrX ?? 82,
    qrY: template?.qrY ?? 12,
    primaryTextColor:
      template?.primaryTextColor ?? "#111111",
  };
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function roundPercent(value: number): number {
  return Number(value.toFixed(2));
}
