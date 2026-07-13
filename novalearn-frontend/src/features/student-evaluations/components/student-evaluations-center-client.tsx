"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  PlayCircle,
  Timer,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  getStudentEvaluations,
  type StudentEvaluationOverview,
} from "@/features/student-evaluations/services/student-evaluation.service";

export function StudentEvaluationsCenterClient() {
  const { isChecking } = useAuthGuard(["STUDENT"]);
  const [evaluations, setEvaluations] = useState<
    StudentEvaluationOverview[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    async function loadEvaluations(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setEvaluations(await getStudentEvaluations());
      } catch {
        setError("No se pudieron cargar tus evaluaciones.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvaluations();
  }, [isChecking]);

  const stats = useMemo(
    () => buildEvaluationStats(evaluations),
    [evaluations]
  );

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Evaluaciones"
      description="Consulta tus evaluaciones pendientes, en progreso y completadas."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando evaluaciones...
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <EvaluationMetricCard
              title="Disponibles"
              value={evaluations.length}
              description="Evaluaciones publicadas"
              icon={ClipboardCheck}
            />
            <EvaluationMetricCard
              title="Pendientes"
              value={stats.pending}
              description="Aún sin intento"
              icon={Clock3}
            />
            <EvaluationMetricCard
              title="En progreso"
              value={stats.inProgress}
              description="Intentos abiertos"
              icon={Timer}
            />
            <EvaluationMetricCard
              title="Completadas"
              value={stats.completed}
              description="Enviadas o calificadas"
              icon={CheckCircle2}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Centro de evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {evaluations.length === 0 ? (
                <EmptyEvaluationsState />
              ) : (
                <div className="max-h-[560px] min-w-0 overflow-auto">
                  <EvaluationsTable evaluations={evaluations} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}

function EvaluationMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function EvaluationsTable({
  evaluations,
}: {
  evaluations: StudentEvaluationOverview[];
}) {
  return (
    <Table className="min-w-[1040px] table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[28%]">Evaluación</TableHead>
          <TableHead className="w-[24%]">Curso</TableHead>
          <TableHead className="w-[13%]">Estado</TableHead>
          <TableHead className="w-[13%]">Vence</TableHead>
          <TableHead className="w-[12%]">Intentos</TableHead>
          <TableHead className="w-[10%] text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => (
          <TableRow key={evaluation.id}>
            <TableCell className="whitespace-normal align-top">
              <p className="break-words font-medium leading-5">
                {evaluation.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getEvaluationTypeLabel(evaluation.evaluationType)} ·{" "}
                {getDeliveryModeLabel(evaluation.deliveryMode)}
              </p>
            </TableCell>
            <TableCell className="whitespace-normal align-top">
              <p className="break-words leading-5">
                {evaluation.courseTitle}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {evaluation.moduleTitle}
              </p>
            </TableCell>
            <TableCell className="align-top">
              <EvaluationStatusBadge evaluation={evaluation} />
            </TableCell>
            <TableCell className="align-top">
              {evaluation.dueAt ? formatDate(evaluation.dueAt) : "-"}
            </TableCell>
            <TableCell className="align-top">
              {evaluation.attemptsUsed} de {evaluation.maxAttempts}
            </TableCell>
            <TableCell className="text-right align-top">
              <Button asChild variant="outline" size="sm">
                <Link href={`/student/evaluations/${evaluation.id}`}>
                  {getActionLabel(evaluation)}
                  <PlayCircle className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EvaluationStatusBadge({
  evaluation,
}: {
  evaluation: StudentEvaluationOverview;
}) {
  const status = getEvaluationState(evaluation);

  if (status === "completed") {
    return (
      <Badge>
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Completada
      </Badge>
    );
  }

  if (status === "in_progress") {
    return <Badge variant="secondary">En progreso</Badge>;
  }

  if (status === "overdue") {
    return <Badge variant="destructive">Vencida</Badge>;
  }

  return <Badge variant="outline">Pendiente</Badge>;
}

function EmptyEvaluationsState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">
        No hay evaluaciones disponibles
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Cuando tus cursos tengan evaluaciones publicadas, aparecerán en este
        centro.
      </p>
    </div>
  );
}

type EvaluationState =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

function buildEvaluationStats(evaluations: StudentEvaluationOverview[]) {
  return evaluations.reduce(
    (stats, evaluation) => {
      const state = getEvaluationState(evaluation);

      return {
        pending: stats.pending + (state === "pending" ? 1 : 0),
        inProgress:
          stats.inProgress + (state === "in_progress" ? 1 : 0),
        completed:
          stats.completed + (state === "completed" ? 1 : 0),
      };
    },
    { pending: 0, inProgress: 0, completed: 0 }
  );
}

function getEvaluationState(
  evaluation: StudentEvaluationOverview
): EvaluationState {
  if (
    evaluation.latestAttemptStatus === "SUBMITTED" ||
    evaluation.latestAttemptStatus === "GRADED"
  ) {
    return "completed";
  }

  if (evaluation.latestAttemptStatus === "IN_PROGRESS") {
    return "in_progress";
  }

  if (evaluation.dueAt && new Date(evaluation.dueAt) < new Date()) {
    return "overdue";
  }

  return "pending";
}

function getActionLabel(evaluation: StudentEvaluationOverview): string {
  const state = getEvaluationState(evaluation);

  if (state === "completed") {
    return "Ver";
  }

  if (state === "in_progress") {
    return "Continuar";
  }

  return "Abrir";
}

function getEvaluationTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    QUIZ: "Cuestionario",
    PRACTICE: "Práctica",
    MIDTERM: "Parcial",
    FINAL_EXAM: "Final",
  };

  return labels[value] ?? value;
}

function getDeliveryModeLabel(value: string): string {
  const labels: Record<string, string> = {
    ONLINE_QUIZ: "Online",
    TEXT_SUBMISSION: "Texto",
    FILE_SUBMISSION: "Archivo",
    HYBRID: "Híbrida",
  };

  return labels[value] ?? value;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
