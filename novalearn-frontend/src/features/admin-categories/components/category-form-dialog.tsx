"use client";

import { Loader2 } from "lucide-react";
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
  AdminCategory,
  AdminCategoryRequest,
} from "@/features/admin-categories/types/admin-category.types";

interface CategoryFormDialogProps {
  open: boolean;
  category: AdminCategory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    request: AdminCategoryRequest
  ) => Promise<void>;
}

const EMPTY_FORM: AdminCategoryRequest = {
  name: "",
  description: "",
  active: true,
};

function createInitialForm(
  category: AdminCategory | null
): AdminCategoryRequest {
  if (!category) {
    return { ...EMPTY_FORM };
  }

  return {
    name: category.name,
    description: category.description,
    active: category.active,
  };
}

export function CategoryFormDialog({
  open,
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState<AdminCategoryRequest>(
  () => createInitialForm(category)
);

  const isEditing = category !== null;

  const canSubmit =
    !isSubmitting &&
    form.name.trim().length >= 2 &&
    form.description.trim().length >= 3;

  function updateField<
    K extends keyof AdminCategoryRequest
  >(
    field: K,
    value: AdminCategoryRequest[K]
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar categoría"
              : "Nueva categoría"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Actualiza la información y disponibilidad de la categoría."
              : "Registra una nueva categoría para organizar los cursos."}
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
              <FieldLabel htmlFor="category-name">
                Nombre
              </FieldLabel>

              <Input
                id="category-name"
                value={form.name}
                maxLength={100}
                disabled={isSubmitting}
                placeholder="Desarrollo Web"
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                required
              />

              <p className="text-xs text-muted-foreground">
                El slug será generado automáticamente por
                el backend.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="category-description">
                Descripción
              </FieldLabel>

              <Textarea
                id="category-description"
                value={form.description}
                maxLength={300}
                disabled={isSubmitting}
                placeholder="Cursos relacionados con tecnologías web."
                className="min-h-28 resize-y"
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                required
              />

              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {form.description.length}/300
                </p>
              </div>
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/20 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={form.active}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField(
                    "active",
                    event.target.checked
                  )
                }
              />

              <div>
                <p className="text-sm font-medium">
                  Categoría activa
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Las categorías activas pueden asignarse
                  a cursos nuevos.
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
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditing
                ? "Guardar cambios"
                : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
