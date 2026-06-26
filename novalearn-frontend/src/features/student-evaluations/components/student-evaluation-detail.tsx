"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  FileQuestion,
  Loader2,
  PlayCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { getStudentEvaluation } from "@/features/student-evaluations/services/student-evaluation.service";
import type {
  Evaluation,
} from "@/features/evaluations/types/evaluation.types";

interface StudentEvaluationDetailProps {
  evaluationId: number;
}

export function StudentEvaluationDetail({
  evaluationId,
}: StudentEvaluationDetailProps) {
  const { isChecking } =
    useAuthGuard(["STUDENT"]);

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const data =
          await getStudentEvaluation(
            evaluationId
          );

        if (!cancelled) {
          setEvaluation(data);
        }
      } catch (
        loadError: unknown
      ) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudo cargar la evaluación."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    evaluationId,
    isChecking,
  ]);

  if (isChecking || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !evaluation) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertTitle>
            Evaluación no disponible
          </AlertTitle>
          <AlertDescription>
            {error ??
              "No se encontró la evaluación."}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const onlineQuiz =
    evaluation.deliveryMode ===
    "ONLINE_QUIZ";

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Button
          asChild
          variant="ghost"
          className="-ml-3"
        >
          <Link
            href={`/student/courses/${evaluation.courseId}/learn`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al contenido
          </Link>
        </Button>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap gap-2">
              <Badge>
                {getTypeLabel(
                  evaluation.evaluationType
                )}
              </Badge>
              <Badge variant="outline">
                {getDeliveryLabel(
                  evaluation.deliveryMode
                )}
              </Badge>
              <Badge variant="outline">
                {evaluation.maxScore} puntos
              </Badge>
            </div>

            <CardTitle className="mt-3 text-2xl">
              {evaluation.title}
            </CardTitle>

            {evaluation.description && (
              <p className="text-sm text-muted-foreground">
                {evaluation.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={CalendarClock}
                label="Disponible desde"
                value={formatDateTime(
                  evaluation.availableFrom
                )}
              />

              <InfoItem
                icon={CalendarClock}
                label="Fecha límite"
                value={formatDateTime(
                  evaluation.dueAt
                )}
              />

              <InfoItem
                icon={ClipboardCheck}
                label="Intentos permitidos"
                value={String(
                  evaluation.maxAttempts
                )}
              />

              <InfoItem
                icon={FileQuestion}
                label="Puntaje aprobatorio"
                value={
                  evaluation.passingScore ===
                  null
                    ? "No definido"
                    : String(
                        evaluation.passingScore
                      )
                }
              />
            </section>

            {evaluation.instructions && (
              <section>
                <h2 className="font-semibold">
                  Instrucciones
                </h2>
                <div className="mt-3 whitespace-pre-wrap rounded-xl border bg-background p-5 text-sm leading-7">
                  {evaluation.instructions}
                </div>
              </section>
            )}

            {onlineQuiz ? (
              <div className="flex justify-end">
                <Button
                  asChild
                  size="lg"
                >
                  <Link
                    href={`/student/evaluations/${evaluation.id}/attempt`}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Iniciar evaluación
                  </Link>
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertTitle>
                  Entrega no disponible todavía
                </AlertTitle>
                <AlertDescription>
                  El flujo para respuestas escritas y archivos se implementará en el siguiente módulo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 font-medium">
        {value}
      </p>
    </div>
  );
}

function getTypeLabel(
  type: Evaluation["evaluationType"]
): string {
  if (type === "PRACTICE") {
    return "Práctica calificada";
  }

  if (type === "MIDTERM") {
    return "Examen parcial";
  }

  if (type === "FINAL_EXAM") {
    return "Examen final";
  }

  return "Quiz";
}

function getDeliveryLabel(
  mode: Evaluation["deliveryMode"]
): string {
  if (mode === "TEXT_SUBMISSION") {
    return "Respuesta escrita";
  }

  if (mode === "FILE_SUBMISSION") {
    return "Entrega de archivos";
  }

  if (mode === "HYBRID") {
    return "Respuesta y archivos";
  }

  return "Cuestionario en línea";
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}