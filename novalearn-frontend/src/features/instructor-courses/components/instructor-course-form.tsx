"use client";

import {
  Award,
  BookOpen,
  CircleDollarSign,
  GraduationCap,
  Loader2,
  Save,
  Tag,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  FormEvent,
  ReactNode,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  InstructorCourseCategory,
  InstructorCourseRequest,
} from "@/features/instructor-courses/types/instructor-course.types";

interface InstructorCourseFormProps {
  categories: InstructorCourseCategory[];
  initialValues?: InstructorCourseRequest;
  isSubmitting: boolean;
  submitLabel: string;
  statusLabel?: string;
  thumbnailSection?: ReactNode;
  onSubmit: (
    request: InstructorCourseRequest
  ) => Promise<void>;
}

const DEFAULT_FORM: InstructorCourseRequest = {
  categoryId: 0,
  title: "",
  shortDescription: "",
  description: "",
  requirements: "",
  targetAudience: "",
  price: 0,
  courseType: "FREE",
  level: "BEGINNER",
  certificateEnabled: true,
};

export function InstructorCourseForm({
  categories,
  initialValues = DEFAULT_FORM,
  isSubmitting,
  submitLabel,
  statusLabel = "Borrador",
  thumbnailSection,
  onSubmit,
}: InstructorCourseFormProps) {
  const [form, setForm] =
    useState<InstructorCourseRequest>(
      () => ({ ...initialValues })
    );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          category.id === form.categoryId
      ),
    [categories, form.categoryId]
  );

  const canSubmit =
    !isSubmitting &&
    form.categoryId > 0 &&
    form.title.trim().length > 0 &&
    form.shortDescription.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.requirements.trim().length > 0 &&
    form.targetAudience.trim().length > 0 &&
    (
      form.courseType === "FREE" ||
      form.price > 0
    );

  function updateField<
    K extends keyof InstructorCourseRequest
  >(
    field: K,
    value: InstructorCourseRequest[K]
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
      ...form,
      title: form.title.trim(),
      shortDescription:
        form.shortDescription.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      targetAudience:
        form.targetAudience.trim(),
      level: form.level.trim(),
      price:
        form.courseType === "FREE"
          ? 0
          : form.price,
    });
  }

  return (
    <form
      onSubmit={(event) =>
        void handleSubmit(event)
      }
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Información general
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">
                    Título del curso
                  </FieldLabel>

                  <Input
                    id="title"
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Java profesional desde cero"
                    maxLength={255}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="shortDescription">
                    Descripción corta
                  </FieldLabel>

                  <Textarea
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(event) =>
                      updateField(
                        "shortDescription",
                        event.target.value
                      )
                    }
                    placeholder="Resumen que aparecerá en el catálogo."
                    className="min-h-20 resize-y"
                    maxLength={500}
                    required
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {form.shortDescription.length}/500
                  </p>
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">
                    Descripción completa
                  </FieldLabel>

                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe los objetivos, contenido y beneficios."
                    className="min-h-32 resize-y"
                    required
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Configuración académica
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="categoryId">
                      Categoría
                    </FieldLabel>

                    <select
                      id="categoryId"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.categoryId}
                      onChange={(event) =>
                        updateField(
                          "categoryId",
                          Number(event.target.value)
                        )
                      }
                      required
                    >
                      <option value={0}>
                        Selecciona una categoría
                      </option>

                      {categories
                        .filter(
                          (category) =>
                            category.active
                        )
                        .map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="level">
                      Nivel
                    </FieldLabel>

                    <select
                      id="level"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.level}
                      onChange={(event) =>
                        updateField(
                          "level",
                          event.target.value
                        )
                      }
                    >
                      <option value="BEGINNER">
                        Principiante
                      </option>
                      <option value="INTERMEDIATE">
                        Intermedio
                      </option>
                      <option value="ADVANCED">
                        Avanzado
                      </option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="courseType">
                      Tipo de curso
                    </FieldLabel>

                    <select
                      id="courseType"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.courseType}
                      onChange={(event) =>
                        updateField(
                          "courseType",
                          event.target.value === "PAID"
                            ? "PAID"
                            : "FREE"
                        )
                      }
                    >
                      <option value="FREE">
                        Gratuito
                      </option>
                      <option value="PAID">
                        De pago
                      </option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="price">
                      Precio en soles
                    </FieldLabel>

                    <Input
                      id="price"
                      type="number"
                      min={
                        form.courseType === "PAID"
                          ? 0.01
                          : 0
                      }
                      step="0.01"
                      value={form.price}
                      disabled={
                        form.courseType === "FREE"
                      }
                      onChange={(event) =>
                        updateField(
                          "price",
                          Number(event.target.value)
                        )
                      }
                      required={
                        form.courseType === "PAID"
                      }
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UsersRound className="h-5 w-5" />
                Contenido y público
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="requirements">
                    Requisitos
                  </FieldLabel>

                  <Textarea
                    id="requirements"
                    value={form.requirements}
                    onChange={(event) =>
                      updateField(
                        "requirements",
                        event.target.value
                      )
                    }
                    placeholder="Conocimientos previos recomendados."
                    className="min-h-24 resize-y"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="targetAudience">
                    Público objetivo
                  </FieldLabel>

                  <Textarea
                    id="targetAudience"
                    value={form.targetAudience}
                    onChange={(event) =>
                      updateField(
                        "targetAudience",
                        event.target.value
                      )
                    }
                    placeholder="Personas a quienes está dirigido."
                    className="min-h-24 resize-y"
                    required
                  />
                </Field>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={
                      form.certificateEnabled
                    }
                    onChange={(event) =>
                      updateField(
                        "certificateEnabled",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Certificado habilitado
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      El estudiante podrá obtener un
                      certificado al completar el curso.
                    </p>
                  </div>
                </label>
              </FieldGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end lg:hidden">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {submitLabel}
            </Button>
          </div>
        </div>

        <aside>
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Resumen del curso
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {thumbnailSection ?? (
                  <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/30">
                    <BookOpen className="h-9 w-9 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <p className="line-clamp-2 font-semibold">
                    {form.title.trim() ||
                      "Título del curso"}
                  </p>

                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {form.shortDescription.trim() ||
                      "La descripción aparecerá aquí."}
                  </p>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <SummaryItem
                    icon={Tag}
                    label="Categoría"
                    value={
                      selectedCategory?.name ??
                      "Sin seleccionar"
                    }
                  />

                  <SummaryItem
                    icon={GraduationCap}
                    label="Nivel"
                    value={translateLevel(
                      form.level
                    )}
                  />

                  <SummaryItem
                    icon={CircleDollarSign}
                    label="Precio"
                    value={
                      form.courseType === "FREE"
                        ? "Gratuito"
                        : formatCurrency(
                            form.price
                          )
                    }
                  />

                  <SummaryItem
                    icon={Award}
                    label="Certificado"
                    value={
                      form.certificateEnabled
                        ? "Habilitado"
                        : "Deshabilitado"
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Badge variant="secondary">
                    {statusLabel}
                  </Badge>

                  <Badge variant="outline">
                    {form.courseType === "FREE"
                      ? "Gratuito"
                      : "De pago"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hidden lg:block">
              <CardContent className="p-4">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  {submitLabel}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  El estado del curso es administrado por
                  NovaLearn.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </form>
  );
}

interface SummaryItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

function translateLevel(level: string): string {
  const labels: Record<string, string> = {
    BEGINNER: "Principiante",
    INTERMEDIATE: "Intermedio",
    ADVANCED: "Avanzado",
  };

  return labels[level.toUpperCase()] ?? level;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
}
