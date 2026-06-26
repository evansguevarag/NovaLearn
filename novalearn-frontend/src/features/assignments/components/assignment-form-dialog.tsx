"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  Assignment,
  AssignmentRequest,
  AssignmentStatus,
} from "@/features/assignments/types/assignment.types";
import type {
  InstructorCourseModule,
} from "@/features/instructor-content/types/instructor-content.types";

interface AssignmentFormDialogProps {
  open: boolean;
  assignment: Assignment | null;
  modules: InstructorCourseModule[];
  initialModuleId: number | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: AssignmentRequest) => Promise<void>;
}

interface AssignmentFormContentProps {
  assignment: Assignment | null;
  modules: InstructorCourseModule[];
  initialModuleId: number | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (request: AssignmentRequest) => Promise<void>;
}

interface AssignmentFormState {
  moduleId: string;
  title: string;
  instructions: string;
  status: AssignmentStatus;
  availableFrom: string;
  dueAt: string;
  maxScore: string;
  allowTextSubmission: boolean;
  allowFileSubmission: boolean;
}

interface AssignmentFormErrors {
  moduleId?: string;
  title?: string;
  instructions?: string;
  dates?: string;
  maxScore?: string;
  submissionType?: string;
}

export function AssignmentFormDialog({
  open,
  assignment,
  modules,
  initialModuleId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AssignmentFormDialogProps) {
  const formKey = assignment
    ? `assignment-${assignment.id}`
    : `new-assignment-${initialModuleId ?? "manual"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <AssignmentFormContent
          key={formKey}
          assignment={assignment}
          modules={modules}
          initialModuleId={initialModuleId}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function AssignmentFormContent({
  assignment,
  modules,
  initialModuleId,
  isSubmitting,
  onCancel,
  onSubmit,
}: AssignmentFormContentProps) {
  const [form, setForm] = useState<AssignmentFormState>(() =>
    createInitialForm(assignment, modules, initialModuleId)
  );

  const [errors, setErrors] = useState<AssignmentFormErrors>({});

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      moduleId: Number(form.moduleId),
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      status: form.status,
      availableFrom: toApiDateTime(form.availableFrom),
      dueAt: toApiDateTime(form.dueAt),
      maxScore: Number(form.maxScore),
      allowTextSubmission: form.allowTextSubmission,
      allowFileSubmission: form.allowFileSubmission,
    });
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Editar tarea" : "Nueva tarea"}
          </DialogTitle>

          <DialogDescription>
            Selecciona la semana a la que pertenece la tarea. Solo las semanas
            con tareas aparecerán en el listado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="assignment-module"
          >
            Semana o módulo
          </label>

          <select
            id="assignment-module"
            value={form.moduleId}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                moduleId: event.target.value,
              }))
            }
          >
            <option value="">Selecciona una semana</option>

            {modules.map((courseModule) => (
              <option key={courseModule.id} value={courseModule.id}>
                Semana {courseModule.sortOrder} · {courseModule.title}
              </option>
            ))}
          </select>

          {errors.moduleId && (
            <p className="text-sm text-destructive">{errors.moduleId}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="assignment-title"
          >
            Título
          </label>

          <Input
            id="assignment-title"
            value={form.title}
            maxLength={255}
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />

          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            htmlFor="assignment-instructions"
          >
            Instrucciones
          </label>

          <Textarea
            id="assignment-instructions"
            value={form.instructions}
            rows={7}
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                instructions: event.target.value,
              }))
            }
          />

          {errors.instructions && (
            <p className="text-sm text-destructive">
              {errors.instructions}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="assignment-status"
            >
              Estado
            </label>

            <select
              id="assignment-status"
              value={form.status}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as AssignmentStatus,
                }))
              }
            >
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicada</option>
              <option value="CLOSED">Cerrada</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="assignment-max-score"
            >
              Puntaje máximo
            </label>

            <Input
              id="assignment-max-score"
              type="number"
              min="0.01"
              step="0.01"
              value={form.maxScore}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  maxScore: event.target.value,
                }))
              }
            />

            {errors.maxScore && (
              <p className="text-sm text-destructive">
                {errors.maxScore}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="assignment-available-from"
            >
              Disponible desde
            </label>

            <Input
              id="assignment-available-from"
              type="datetime-local"
              value={form.availableFrom}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availableFrom: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="assignment-due-at"
            >
              Fecha límite
            </label>

            <Input
              id="assignment-due-at"
              type="datetime-local"
              value={form.dueAt}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueAt: event.target.value,
                }))
              }
            />
          </div>
        </div>

        {errors.dates && (
          <p className="text-sm text-destructive">{errors.dates}</p>
        )}

        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium">
            Tipos de entrega permitidos
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowTextSubmission}
                disabled={isSubmitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    allowTextSubmission: event.target.checked,
                  }))
                }
              />
              Respuesta escrita
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allowFileSubmission}
                disabled={isSubmitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    allowFileSubmission: event.target.checked,
                  }))
                }
              />
              Archivo adjunto
            </label>
          </div>

          {errors.submissionType && (
            <p className="mt-2 text-sm text-destructive">
              {errors.submissionType}
            </p>
          )}

          {form.allowFileSubmission && (
            <p className="mt-3 text-xs text-muted-foreground">
              La carga de archivos se conectará después del flujo de tareas de
              texto.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            {assignment ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function createInitialForm(
  assignment: Assignment | null,
  modules: InstructorCourseModule[],
  initialModuleId: number | null
): AssignmentFormState {
  if (assignment) {
    return {
      moduleId: String(assignment.moduleId),
      title: assignment.title,
      instructions: assignment.instructions,
      status: assignment.status,
      availableFrom: toDateTimeLocal(assignment.availableFrom),
      dueAt: toDateTimeLocal(assignment.dueAt),
      maxScore: String(assignment.maxScore),
      allowTextSubmission: assignment.allowTextSubmission,
      allowFileSubmission: assignment.allowFileSubmission,
    };
  }

  const defaultModuleId =
    initialModuleId ?? modules[0]?.id ?? null;

  return {
    moduleId:
      defaultModuleId === null ? "" : String(defaultModuleId),
    title: "",
    instructions: "",
    status: "DRAFT",
    availableFrom: "",
    dueAt: "",
    maxScore: "20",
    allowTextSubmission: true,
    allowFileSubmission: false,
  };
}

function validateForm(
  form: AssignmentFormState
): AssignmentFormErrors {
  const errors: AssignmentFormErrors = {};

  const moduleId = Number(form.moduleId);

  if (!Number.isInteger(moduleId) || moduleId <= 0) {
    errors.moduleId = "Selecciona una semana válida.";
  }

  if (!form.title.trim()) {
    errors.title = "El título es obligatorio.";
  }

  if (!form.instructions.trim()) {
    errors.instructions = "Las instrucciones son obligatorias.";
  }

  const maxScore = Number(form.maxScore);

  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    errors.maxScore = "El puntaje debe ser mayor que cero.";
  }

  if (
    form.availableFrom &&
    form.dueAt &&
    new Date(form.dueAt) <= new Date(form.availableFrom)
  ) {
    errors.dates =
      "La fecha límite debe ser posterior a la fecha de apertura.";
  }

  if (!form.allowTextSubmission && !form.allowFileSubmission) {
    errors.submissionType =
      "Selecciona al menos un tipo de entrega.";
  }

  return errors;
}

function toDateTimeLocal(value: string | null): string {
  return value ? value.slice(0, 16) : "";
}

function toApiDateTime(value: string): string | null {
  return value ? `${value}:00` : null;
}