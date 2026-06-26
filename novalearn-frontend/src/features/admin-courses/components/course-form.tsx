"use client";

import {
  Award,
  BookOpen,
  CircleDollarSign,
  FilePenLine,
  GraduationCap,
  ImageIcon,
  Loader2,
  Save,
  Tag,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  ElementType,
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

import { getAdminUsers } from "@/features/admin-users/services/admin-user.service";
import type { AdminUser } from "@/features/admin-users/types/admin-user.types";

import type {
  AdminCourseRequest,
  CourseCategory,
  CourseStatus,
  CourseType,
} from "@/features/admin-courses/types/admin-course.types";

interface CourseFormProps {
  categories: CourseCategory[];
  initialValues?: AdminCourseRequest;
  isSubmitting: boolean;
  submitLabel: string;
  thumbnailSection?: ReactNode;
  onSubmit: (request: AdminCourseRequest) => Promise<void>;
}

const DEFAULT_FORM: AdminCourseRequest = {
  instructorId: 0,
  categoryId: 0,
  title: "",
  shortDescription: "",
  description: "",
  requirements: "",
  targetAudience: "",
  thumbnailUrl: null,
  price: 0,
  courseType: "FREE",
  status: "DRAFT",
  level: "BEGINNER",
  certificateEnabled: true,
};

export function CourseForm({
  categories,
  initialValues = DEFAULT_FORM,
  isSubmitting,
  submitLabel,
  thumbnailSection,
  onSubmit,
}: CourseFormProps) {
  const [form, setForm] = useState<AdminCourseRequest>(
    () => ({ ...initialValues })
  );

  const [instructors, setInstructors] = useState<AdminUser[]>(
    []
  );
  const [isLoadingInstructors, setIsLoadingInstructors] =
    useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadInstructors(): Promise<void> {
      try {
        const users = await getAdminUsers();

        if (isCancelled) {
          return;
        }

        const eligibleInstructors = users.filter(
          (user) =>
            user.role === "INSTRUCTOR" ||
            user.role === "ADMIN"
        );

        setInstructors(eligibleInstructors);
      } catch {
        if (!isCancelled) {
          setInstructors([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingInstructors(false);
        }
      }
    }

    void loadInstructors();

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedInstructor = useMemo(
    () =>
      instructors.find(
        (instructor) =>
          instructor.id === form.instructorId
      ),
    [instructors, form.instructorId]
  );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === form.categoryId
      ),
    [categories, form.categoryId]
  );

  const canSubmit =
    !isSubmitting &&
    form.instructorId !== 0 &&
    form.categoryId !== 0 &&
    form.title.trim().length > 0 &&
    form.shortDescription.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.requirements.trim().length > 0 &&
    form.targetAudience.trim().length > 0 &&
    (form.courseType === "FREE" || form.price > 0);

  function updateField<K extends keyof AdminCourseRequest>(
    field: K,
    value: AdminCourseRequest[K]
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
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      targetAudience: form.targetAudience.trim(),
      thumbnailUrl: form.thumbnailUrl?.trim() || null,
      price: form.courseType === "FREE" ? 0 : form.price,
    });
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader className="pb-4">
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
                    placeholder="Desarrollo Web con Angular y Spring Boot"
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
                    placeholder="Resumen breve que aparecerá en el catálogo."
                    className="min-h-20 resize-y"
                    maxLength={250}
                    required
                  />

                  <div className="flex justify-end">
                    <p className="text-xs text-muted-foreground">
                      {form.shortDescription.length}/250
                      caracteres
                    </p>
                  </div>
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
                    placeholder="Describe el contenido, objetivos y beneficios del curso."
                    className="min-h-28 resize-y"
                    required
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Asignación académica
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="instructorId">
                      Instructor
                    </FieldLabel>

                    <select
                      id="instructorId"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.instructorId}
                      disabled={isLoadingInstructors}
                      onChange={(event) =>
                        updateField(
                          "instructorId",
                          Number(event.target.value)
                        )
                      }
                      required
                    >
                      <option value={0}>
                        {isLoadingInstructors
                          ? "Cargando instructores..."
                          : "Selecciona un instructor"}
                      </option>

                      {instructors.map((instructor) => (
                        <option
                          key={instructor.id}
                          value={instructor.id}
                        >
                          {instructor.firstName}{" "}
                          {instructor.lastName} —{" "}
                          {instructor.email}
                        </option>
                      ))}
                    </select>
                  </Field>

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
                          (category) => category.active
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
                </div>

                <div className="grid gap-4 md:grid-cols-3">
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
                          event.target.value as CourseType
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
                    <FieldLabel htmlFor="status">
                      Estado inicial
                    </FieldLabel>

                    <select
                      id="status"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={form.status}
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.value as CourseStatus
                        )
                      }
                    >
                      <option value="DRAFT">
                        Borrador
                      </option>
                      <option value="PUBLISHED">
                        Publicado
                      </option>
                      <option value="ARCHIVED">
                        Archivado
                      </option>
                    </select>
                  </Field>
                </div>

                {form.courseType === "PAID" && (
                  <Field>
                    <FieldLabel htmlFor="price">
                      Precio en soles
                    </FieldLabel>

                    <Input
                      id="price"
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField(
                          "price",
                          Number(event.target.value)
                        )
                      }
                      placeholder="99.90"
                      required
                    />
                  </Field>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="h-5 w-5" />
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
                    placeholder="Personas a quienes está dirigido el curso."
                    className="min-h-24 resize-y"
                    required
                  />
                </Field>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={form.certificateEnabled}
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:hidden">
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

        <aside className="min-w-0">
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Resumen del curso
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {thumbnailSection ?? (
                  <ThumbnailPreview
                    thumbnailUrl={form.thumbnailUrl}
                  />
                )}

                <div>
                  <p className="line-clamp-2 font-semibold">
                    {form.title.trim() || "Título del curso"}
                  </p>

                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {form.shortDescription.trim() ||
                      "La descripción corta aparecerá aquí."}
                  </p>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <SummaryItem
                    icon={UserRound}
                    label="Instructor"
                    value={
                      selectedInstructor
                        ? `${selectedInstructor.firstName} ${selectedInstructor.lastName}`
                        : "Sin seleccionar"
                    }
                  />

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
                    value={translateLevel(form.level)}
                  />

                  <SummaryItem
                    icon={FilePenLine}
                    label="Estado"
                    value={translateStatus(form.status)}
                  />

                  <SummaryItem
                    icon={CircleDollarSign}
                    label="Precio"
                    value={
                      form.courseType === "FREE"
                        ? "Gratuito"
                        : formatCurrency(form.price)
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
                    {translateStatus(form.status)}
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
                  Completa los campos obligatorios para
                  continuar.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </form>
  );
}

interface ThumbnailPreviewProps {
  thumbnailUrl: string | null;
}

function ThumbnailPreview({
  thumbnailUrl,
}: ThumbnailPreviewProps) {
  return (
    <div
      className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border bg-muted/40 bg-cover bg-center bg-no-repeat"
      style={
        thumbnailUrl
          ? {
              backgroundImage: `url(${JSON.stringify(
                thumbnailUrl
              )})`,
            }
          : undefined
      }
      role={thumbnailUrl ? "img" : undefined}
      aria-label={
        thumbnailUrl
          ? "Vista previa de la miniatura del curso"
          : undefined
      }
    >
      {!thumbnailUrl && (
        <div className="flex flex-col items-center gap-2 px-5 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />

          <span className="text-xs leading-5">
            La miniatura se podrá subir después de crear
            el curso.
          </span>
        </div>
      )}
    </div>
  );
}

interface SummaryItemProps {
  icon: ElementType;
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

        <p
          className="truncate text-sm font-medium"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function translateStatus(
  status: CourseStatus
): string {
  const labels: Record<CourseStatus, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ARCHIVED: "Archivado",
  };

  return labels[status];
}

function translateLevel(level: string): string {
  const labels: Record<string, string> = {
    BEGINNER: "Principiante",
    BASIC: "Básico",
    BASICO: "Básico",
    INTERMEDIATE: "Intermedio",
    INTERMEDIO: "Intermedio",
    ADVANCED: "Avanzado",
    AVANZADO: "Avanzado",
  };

  return labels[level.toUpperCase()] ?? level;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
}
