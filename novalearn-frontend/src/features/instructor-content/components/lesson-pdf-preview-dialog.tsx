"use client";

import {
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LessonPdfPreviewDialogProps {
  open: boolean;
  pdfUrl: string | null;
  fileName: string | null;
  onOpenChange: (open: boolean) => void;
}

export function LessonPdfPreviewDialog({
  open,
  pdfUrl,
  fileName,
  onOpenChange,
}: LessonPdfPreviewDialogProps) {
  const resolvedFileName =
    normalizeFileName(fileName);

  const downloadUrl =
    pdfUrl
      ? createCloudinaryDownloadUrl(
          pdfUrl,
          resolvedFileName
        )
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="flex h-[92vh] max-h-[92vh] w-[96vw] max-w-6xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="size-5 shrink-0" />

                <span className="truncate">
                  {resolvedFileName}
                </span>
              </DialogTitle>

              <DialogDescription className="mt-1">
                Vista previa del material PDF de la
                lección.
              </DialogDescription>
            </div>

            {pdfUrl && (
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="outline"
                >
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 size-4" />
                    Abrir aparte
                  </a>
                </Button>

                {downloadUrl && (
                  <Button
                    asChild
                    type="button"
                    size="sm"
                  >
                    <a href={downloadUrl}>
                      <Download className="mr-2 size-4" />
                      Descargar PDF
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-muted/30 p-3 sm:p-4">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={`Vista previa de ${resolvedFileName}`}
              className="h-full min-h-[60vh] w-full rounded-lg border bg-background"
            />
          ) : (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
              <FileText className="size-10 text-muted-foreground" />

              <p className="mt-4 font-medium">
                PDF no disponible
              </p>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                La lección no tiene un archivo PDF
                válido asociado.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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

function createCloudinaryDownloadUrl(
  pdfUrl: string,
  fileName: string
): string {
  if (
    !pdfUrl.includes(
      "/image/upload/"
    )
  ) {
    return pdfUrl;
  }

  const safeFileName =
    fileName
      .replace(/\.pdf$/i, "")
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );

  const transformation =
    `fl_attachment:${safeFileName}`;

  return pdfUrl.replace(
    "/image/upload/",
    `/image/upload/${transformation}/`
  );
}