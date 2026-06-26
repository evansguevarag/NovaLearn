"use client";

import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  InstructorCourseModule,
  InstructorCourseModuleRequest,
} from "@/features/instructor-content/types/instructor-content.types";

interface ModuleFormDialogProps {
  open: boolean;
  courseId: number;
  module: InstructorCourseModule | null;
  suggestedSortOrder: number;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    request: InstructorCourseModuleRequest
  ) => Promise<void>;
}

interface ModuleFormState {
  title: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

function createInitialForm(
  module: InstructorCourseModule | null,
  suggestedSortOrder: number
): ModuleFormState {
  if (module) {
    return {
      title: module.title,
      description: module.description ?? "",
      sortOrder: module.sortOrder,
      active: module.active,
    };
  }

  return {
    title: "",
    description: "",
    sortOrder: suggestedSortOrder,
    active: true,
  };
}

export function ModuleFormDialog({
  open,
  courseId,
  module,
  suggestedSortOrder,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ModuleFormDialogProps) {
  const [form, setForm] = useState<ModuleFormState>(
    () => createInitialForm(module, suggestedSortOrder)
  );

  const isEditing = module !== null;

  const canSubmit =
    !isSubmitting &&
    form.title.trim().length > 0 &&
    Number.isInteger(form.sortOrder) &&
    form.sortOrder >= 1;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await onSubmit({
      courseId,
      title: form.title.trim(),
      description:
        form.description.trim().length > 0
          ? form.description.trim()
          : null,
      sortOrder: form.sortOrder,
      active: form.active,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar módulo"
              : "Crear módulo"}
          </DialogTitle>

          <DialogDescription>
            Organiza las lecciones del curso dentro de
            secciones ordenadas.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) =>
            void handleSubmit(event)
          }
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="module-title">
                Título del módulo
              </FieldLabel>

              <Input
                id="module-title"
                value={form.title}
                maxLength={255}
                placeholder="Fundamentos de Java"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="module-description">
                Descripción
              </FieldLabel>

              <Textarea
                id="module-description"
                value={form.description}
                placeholder="Describe brevemente el contenido del módulo."
                className="min-h-24 resize-y"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="module-sort-order">
                Orden
              </FieldLabel>

              <Input
                id="module-sort-order"
                type="number"
                min={1}
                step={1}
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: Number(
                      event.target.value
                    ),
                  }))
                }
                required
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />

              <div>
                <p className="text-sm font-medium">
                  Módulo activo
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  El módulo estará disponible dentro de la
                  estructura académica del curso.
                </p>
              </div>
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {isEditing
                ? "Guardar cambios"
                : "Crear módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}