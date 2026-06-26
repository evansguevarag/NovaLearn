"use client";

import {
  ExternalLink,
  FileText,
} from "lucide-react";

interface LessonPdfThumbnailProps {
  pdfUrl: string;
  fileName: string | null;
  fileSize?: number | null;
  onPreview?: () => void;
}

export function LessonPdfThumbnail({
  pdfUrl,
  fileName,
  fileSize = null,
}: LessonPdfThumbnailProps) {
  const resolvedFileName =
    normalizeFileName(fileName);

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex w-full items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Abrir ${resolvedFileName} en otra pestaña`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <FileText className="size-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {resolvedFileName}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>Documento PDF</span>

            {fileSize !== null && (
              <>
                <span aria-hidden="true">
                  ·
                </span>

                <span>
                  {formatFileSize(fileSize)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        <span className="hidden sm:inline">
          Abrir PDF
        </span>

        <ExternalLink className="size-4" />
      </div>
    </a>
  );
}

function normalizeFileName(
  fileName: string | null
): string {
  const normalized =
    fileName?.trim();

  if (!normalized) {
    return "recurso.pdf";
  }

  return normalized
    .toLowerCase()
    .endsWith(".pdf")
      ? normalized
      : `${normalized}.pdf`;
}

function formatFileSize(
  size: number
): string {
  if (
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