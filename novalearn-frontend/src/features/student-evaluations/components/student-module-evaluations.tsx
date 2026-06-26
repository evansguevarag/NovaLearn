import Link from "next/link";
import {
  CalendarClock,
  ClipboardCheck,
  FileQuestion,
  FileUp,
  TextCursorInput,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type {
  Evaluation,
  EvaluationDeliveryMode,
  EvaluationType,
} from "@/features/evaluations/types/evaluation.types";

interface StudentModuleEvaluationsProps {
  evaluations: Evaluation[];
}

export function StudentModuleEvaluations({
  evaluations,
}: StudentModuleEvaluationsProps) {
  if (evaluations.length === 0) {
    return null;
  }

  return (
    <section className="mt-3 border-t pt-3">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Evaluaciones
      </p>

      <div className="space-y-1">
        {evaluations.map(
          (evaluation) => (
            <StudentEvaluationLink
              key={evaluation.id}
              evaluation={evaluation}
            />
          )
        )}
      </div>
    </section>
  );
}

function StudentEvaluationLink({
  evaluation,
}: {
  evaluation: Evaluation;
}) {
  return (
    <Link
      href={`/student/evaluations/${evaluation.id}`}
      className="block rounded-md border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-background"
    >
      <div className="flex items-start gap-3">
        {renderDeliveryIcon(
          evaluation.deliveryMode
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {evaluation.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="text-[10px]"
            >
              {getTypeLabel(
                evaluation.evaluationType
              )}
            </Badge>

            <Badge
              variant="outline"
              className="text-[10px]"
            >
              {evaluation.maxScore} pts.
            </Badge>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>
              {evaluation.dueAt
                ? `Hasta ${formatDateTime(
                    evaluation.dueAt
                  )}`
                : "Sin fecha límite"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function renderDeliveryIcon(
  mode: EvaluationDeliveryMode
): React.ReactNode {
  const className =
    "mt-0.5 h-4 w-4 shrink-0 text-primary";

  if (mode === "TEXT_SUBMISSION") {
    return (
      <TextCursorInput
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (mode === "FILE_SUBMISSION") {
    return (
      <FileUp
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (mode === "HYBRID") {
    return (
      <Workflow
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (mode === "ONLINE_QUIZ") {
    return (
      <FileQuestion
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <ClipboardCheck
      className={className}
      aria-hidden="true"
    />
  );
}

function getTypeLabel(
  type: EvaluationType
): string {
  if (type === "PRACTICE") {
    return "Práctica";
  }

  if (type === "MIDTERM") {
    return "Parcial";
  }

  if (type === "FINAL_EXAM") {
    return "Final";
  }

  return "Quiz";
}

function formatDateTime(
  value: string
): string {
  return new Intl.DateTimeFormat(
    "es-PE",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(value));
}