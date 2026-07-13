"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Download,
  Loader2,
  PlayCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  downloadStudentCertificatePdf,
  getStudentCertificates,
} from "@/features/dashboard/services/student-dashboard.service";
import type { StudentCertificate } from "@/features/dashboard/types/student-dashboard.types";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function StudentCertificatesClient() {
  const { isChecking } = useAuthGuard(["STUDENT"]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadCertificates(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setCertificates(await getStudentCertificates());
      } catch {
        setError("No se pudieron cargar tus certificados.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCertificates();
  }, [isChecking]);

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Mis certificados"
      description="Revisa tus certificados disponibles y cursos próximos a completar."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando certificados...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && certificates.length === 0 && (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              Aún no tienes certificados
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Cuando completes un curso con certificado habilitado, aparecerá
              disponible en esta sección.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && certificates.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.enrollmentId}
              certificate={certificate}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function CertificateCard({
  certificate,
}: {
  certificate: StudentCertificate;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload(): Promise<void> {
    try {
      setIsDownloading(true);
      const pdf = await downloadStudentCertificatePdf(certificate.id);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-novalearn-${certificate.certificateCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex aspect-video items-center justify-center bg-muted">
        <Award className="h-14 w-14 text-muted-foreground" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Emitido
          </Badge>
          <Badge variant="secondary">{certificate.certificateCode}</Badge>
        </div>

        <CardTitle className="mt-3 line-clamp-2 text-lg">
          {certificate.courseTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">Fecha de emisión</p>
        <p className="mt-1 font-medium">
          {new Date(certificate.issuedAt).toLocaleDateString("es-PE")}
        </p>
      </CardContent>

      <CardFooter className="grid gap-2 border-t pt-4">
        <Button
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Descargar PDF
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/student/courses/${certificate.courseId}/learn`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Ver curso
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
