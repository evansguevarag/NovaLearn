"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileEdit,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

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

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { AssignmentFormDialog } from "@/features/assignments/components/assignment-form-dialog";
import {
  createManagedAssignment,
  deleteManagedAssignment,
  getManagedAssignments,
  updateManagedAssignment,
} from "@/features/assignments/services/assignment.service";
import type {
  Assignment,
  AssignmentRequest,
  AssignmentStatus,
} from "@/features/assignments/types/assignment.types";
import { ManagedCourseTabs } from "@/features/instructor-content/components/managed-course-tabs";
import {
  getManagedCourseById,
  getManagedCourseModules,
  type CourseContentContext,
  type CourseContentSummary,
} from "@/features/instructor-content/services/course-content.service";
import type {
  InstructorCourseModule,
} from "@/features/instructor-content/types/instructor-content.types";

interface ManagedCourseAssignmentsClientProps {
  courseId: number;
  context: CourseContentContext;
}

interface AssignmentGroup {
  module: InstructorCourseModule;
  assignments: Assignment[];
}

export function ManagedCourseAssignmentsClient({
  courseId,
  context,
}: ManagedCourseAssignmentsClientProps) {
  const allowedRoles =
    context === "ADMIN"
      ? (["ADMIN"] as const)
      : (["INSTRUCTOR"] as const);

  const { isChecking } =
    useAuthGuard([...allowedRoles]);

  const [course, setCourse] =
    useState<CourseContentSummary | null>(null);
  const [modules, setModules] =
    useState<InstructorCourseModule[]>([]);
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] =
    useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [initialModuleId, setInitialModuleId] =
    useState<number | null>(null);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let cancelled = false;

    async function initialize(): Promise<void> {
      try {
        setError(null);

        const [courseData, moduleData, assignmentData] =
          await Promise.all([
            getManagedCourseById(context, courseId),
            getManagedCourseModules(context, courseId),
            getManagedAssignments(context, courseId),
          ]);

        if (cancelled) {
          return;
        }

        setCourse(courseData);
        setModules(
          [...moduleData].sort(
            (first, second) =>
              first.sortOrder - second.sortOrder
          )
        );
        setAssignments(assignmentData);
      } catch (loadError: unknown) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudieron cargar las tareas del curso."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [context, courseId, isChecking]);

  const groups = useMemo<AssignmentGroup[]>(
    () =>
      modules
        .map((courseModule) => ({
          module: courseModule,
          assignments: assignments.filter(
            (assignment) =>
              assignment.moduleId === courseModule.id
          ),
        }))
        .filter(
          (group) => group.assignments.length > 0
        ),
    [assignments, modules]
  );

  const publishedCount = assignments.filter(
    (assignment) => assignment.status === "PUBLISHED"
  ).length;

  const draftCount = assignments.filter(
    (assignment) => assignment.status === "DRAFT"
  ).length;

  const closedCount = assignments.filter(
    (assignment) => assignment.status === "CLOSED"
  ).length;

  const basePath =
    context === "ADMIN"
      ? `/admin/courses/${courseId}`
      : `/instructor/courses/${courseId}`;

  function openGeneralCreateDialog(): void {
    setSelectedAssignment(null);
    setInitialModuleId(null);
    setIsFormOpen(true);
  }

  function openModuleCreateDialog(moduleId: number): void {
    setSelectedAssignment(null);
    setInitialModuleId(moduleId);
    setIsFormOpen(true);
  }

  function openEditDialog(assignment: Assignment): void {
    setSelectedAssignment(assignment);
    setInitialModuleId(assignment.moduleId);
    setIsFormOpen(true);
  }

  async function reloadAssignments(): Promise<void> {
    const assignmentData =
      await getManagedAssignments(context, courseId);

    setAssignments(assignmentData);
  }

  async function handleSubmit(
    request: AssignmentRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);

      if (selectedAssignment) {
        await updateManagedAssignment(
          context,
          selectedAssignment.id,
          request
        );

        toast.success("Tarea actualizada correctamente.");
      } else {
        await createManagedAssignment(context, request);
        toast.success("Tarea creada correctamente.");
      }

      setIsFormOpen(false);
      setSelectedAssignment(null);
      setInitialModuleId(null);

      await reloadAssignments();
    } catch (submitError: unknown) {
      toast.error(
        getApiErrorMessage(
          submitError,
          "No se pudo guardar la tarea."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(
    assignment: Assignment
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Eliminar la tarea "${assignment.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteManagedAssignment(
        context,
        assignment.id
      );

      toast.success("Tarea eliminada correctamente.");
      await reloadAssignments();
    } catch (deleteError: unknown) {
      toast.error(
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar la tarea."
        )
      );
    }
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Tareas"
        description="Cargando tareas del curso."
      >
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No fue posible abrir el curso."
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ?? "No se encontró el curso solicitado."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell
        title="Tareas del curso"
        description={course.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al curso
              </Link>
            </Button>

            <Button
              onClick={openGeneralCreateDialog}
              disabled={modules.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva tarea
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <ManagedCourseTabs
            courseId={courseId}
            context={context}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total"
              value={assignments.length}
              icon={ClipboardList}
            />
            <MetricCard
              title="Publicadas"
              value={publishedCount}
              icon={CheckCircle2}
            />
            <MetricCard
              title="Borradores"
              value={draftCount}
              icon={FileEdit}
            />
            <MetricCard
              title="Cerradas"
              value={closedCount}
              icon={CalendarClock}
            />
          </section>

          {modules.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <Layers3 className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                  Primero crea las semanas
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Las tareas deben pertenecer a una semana o módulo del curso.
                </p>
                <Button asChild className="mt-5">
                  <Link href={`${basePath}/content`}>
                    Administrar contenido
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                  Este curso todavía no tiene tareas
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Crea la primera tarea y selecciona la semana en el
                  formulario.
                </p>
                <Button
                  className="mt-5"
                  onClick={openGeneralCreateDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera tarea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {groups.map((group) => (
                <AssignmentGroupCard
                  key={group.module.id}
                  group={group}
                  onCreate={() =>
                    openModuleCreateDialog(group.module.id)
                  }
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardShell>

      <AssignmentFormDialog
        open={isFormOpen}
        assignment={selectedAssignment}
        modules={modules}
        initialModuleId={initialModuleId}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open) {
            setSelectedAssignment(null);
            setInitialModuleId(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

interface AssignmentGroupCardProps {
  group: AssignmentGroup;
  onCreate: () => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => Promise<void>;
}

function AssignmentGroupCard({
  group,
  onCreate,
  onEdit,
  onDelete,
}: AssignmentGroupCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Semana {group.module.sortOrder}
              </Badge>

              <Badge variant="secondary">
                {group.assignments.length}{" "}
                {group.assignments.length === 1
                  ? "tarea"
                  : "tareas"}
              </Badge>
            </div>

            <CardTitle className="mt-3 text-lg">
              {group.module.title}
            </CardTitle>

            {group.module.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {group.module.description}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear en esta semana
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {group.assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={() => onEdit(assignment)}
              onDelete={() => void onDelete(assignment)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: () => void;
}

function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  return (
    <article className="rounded-xl border p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={assignment.status} />
            <Badge variant="outline">
              {assignment.maxScore} puntos
            </Badge>
          </div>

          <h3 className="mt-3 font-semibold">
            {assignment.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {assignment.instructions}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              Apertura: {formatDateTime(assignment.availableFrom)}
            </span>
            <span>
              Cierre: {formatDateTime(assignment.dueAt)}
            </span>
            <span>
              Entrega: {getSubmissionTypes(assignment)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  if (status === "PUBLISHED") {
    return <Badge>Publicada</Badge>;
  }

  if (status === "CLOSED") {
    return <Badge variant="secondary">Cerrada</Badge>;
  }

  return <Badge variant="outline">Borrador</Badge>;
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSubmissionTypes(
  assignment: Assignment
): string {
  if (
    assignment.allowTextSubmission &&
    assignment.allowFileSubmission
  ) {
    return "Texto o archivo";
  }

  if (assignment.allowFileSubmission) {
    return "Archivo";
  }

  return "Texto";
}