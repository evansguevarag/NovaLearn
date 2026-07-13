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
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { getAdminUsers } from "@/features/admin-users/services/admin-user.service";
import type { AdminUser } from "@/features/admin-users/types/admin-user.types";
import {
  getPaymentSettings,
  updatePaymentSettings,
} from "@/features/admin-courses/services/payment-settings.service";

import type {
  AdminCourseRequest,
  CourseCategory,
  CourseStatus,
  CourseType,
} from "@/features/admin-courses/types/admin-course.types";
import type { PaymentSettings } from "@/features/admin-courses/types/payment-settings.types";

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

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  processingFeePercentage: 4.02,
  processingFeeTaxPercentage: 0,
  passProcessingFeeToStudent: true,
  culqiPaymentsEnabled: true,
  manualPaymentsEnabled: true,
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
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [editablePaymentSettings, setEditablePaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] =
    useState(false);
  const [priceInput, setPriceInput] = useState(() =>
    initialValues.price > 0 ? String(initialValues.price) : ""
  );
  const [processingFeeInput, setProcessingFeeInput] =
    useState("4.02");

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

  useEffect(() => {
    let isCancelled = false;

    async function loadPaymentSettings(): Promise<void> {
      try {
        const settings = await getPaymentSettings();

        if (!isCancelled) {
          setPaymentSettings(settings);
          setEditablePaymentSettings(settings);
          setProcessingFeeInput(
            formatNumberInput(settings.processingFeePercentage)
          );
        }
      } catch {
        if (!isCancelled) {
          setPaymentSettings(null);
          setEditablePaymentSettings(null);
        }
      }
    }

    void loadPaymentSettings();

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

  const priceBreakdown = useMemo(
    () =>
      calculatePriceBreakdown(
        form.price,
        editablePaymentSettings ?? paymentSettings
      ),
    [form.price, editablePaymentSettings, paymentSettings]
  );

  function updateField<K extends keyof AdminCourseRequest>(
    field: K,
    value: AdminCourseRequest[K]
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePriceInput(value: string): void {
    setPriceInput(value);
    updateField("price", parseNumberInput(value));
  }

  function updateProcessingFeeInput(value: string): void {
    setProcessingFeeInput(value);

    updateEditablePaymentSettings(
      "processingFeePercentage",
      parseNumberInput(value)
    );
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

  function updateEditablePaymentSettings<K extends keyof PaymentSettings>(
    field: K,
    value: PaymentSettings[K]
  ): void {
    setEditablePaymentSettings((current) => ({
      ...(current ?? {
        ...DEFAULT_PAYMENT_SETTINGS,
        processingFeePercentage: parseNumberInput(
          processingFeeInput
        ),
        passProcessingFeeToStudent: true,
      }),
      [field]: value,
    }));
  }

  async function handleSavePaymentSettings(): Promise<void> {
    if (!editablePaymentSettings) {
      return;
    }

    try {
      setIsSavingPaymentSettings(true);

      const settings = await updatePaymentSettings(
        {
          processingFeePercentage:
            editablePaymentSettings.processingFeePercentage,
          passProcessingFeeToStudent:
            editablePaymentSettings.passProcessingFeeToStudent,
          culqiPaymentsEnabled:
            editablePaymentSettings.culqiPaymentsEnabled,
          manualPaymentsEnabled:
            editablePaymentSettings.manualPaymentsEnabled,
        }
      );

      setPaymentSettings(settings);
      setEditablePaymentSettings(settings);

      toast.success("Métodos de pago actualizados.", {
        description:
          "Los próximos pagos usarán esta configuración.",
      });
    } catch {
      toast.error("No se pudo actualizar la comisión.", {
        description:
          "Revisa el porcentaje e inténtalo nuevamente.",
      });
    } finally {
      setIsSavingPaymentSettings(false);
    }
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
                      value={priceInput}
                      onChange={(event) =>
                        updatePriceInput(event.target.value)
                      }
                      placeholder="99.90"
                      required
                    />

                    <PaymentFeePreview
                      breakdown={priceBreakdown}
                      settings={editablePaymentSettings}
                      processingFeeInput={processingFeeInput}
                      isSaving={isSavingPaymentSettings}
                      onChange={updateEditablePaymentSettings}
                      onProcessingFeeChange={
                        updateProcessingFeeInput
                      }
                      onSave={() =>
                        void handleSavePaymentSettings()
                      }
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
                    label={
                      form.courseType === "FREE"
                        ? "Precio"
                        : "Precio base"
                    }
                    value={
                      form.courseType === "FREE"
                        ? "Gratuito"
                        : formatCurrency(form.price)
                    }
                  />

                  {form.courseType === "PAID" && (
                    <SummaryItem
                      icon={CircleDollarSign}
                      label="Precio estudiante"
                      value={formatCurrency(
                        priceBreakdown.totalAmount
                      )}
                    />
                  )}

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

interface PaymentFeePreviewProps {
  breakdown: PriceBreakdown;
  settings: PaymentSettings | null;
  processingFeeInput: string;
  isSaving: boolean;
  onChange: <K extends keyof PaymentSettings>(
    field: K,
    value: PaymentSettings[K]
  ) => void;
  onProcessingFeeChange: (value: string) => void;
  onSave: () => void;
}

function PaymentFeePreview({
  breakdown,
  settings,
  processingFeeInput,
  isSaving,
  onChange,
  onProcessingFeeChange,
  onSave,
}: PaymentFeePreviewProps) {
  if (!settings) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Cargando configuración de cobro...
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border bg-muted/20 p-3 text-sm">
      <div>
        <FieldLabel htmlFor="processingFeePercentage">
          Porcentaje Culqi (%)
        </FieldLabel>
        <Input
          id="processingFeePercentage"
          type="number"
          min={0}
          step="0.01"
          value={processingFeeInput}
          onChange={(event) =>
            onProcessingFeeChange(event.target.value)
          }
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Recargo estimado:{" "}
          {formatCurrency(breakdown.processingFeeAmount)}
        </p>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={settings.passProcessingFeeToStudent}
          onChange={(event) =>
            onChange(
              "passProcessingFeeToStudent",
              event.target.checked
            )
          }
        />
        Sumar comisión al precio final del estudiante.
      </label>

      <div className="mt-3 grid gap-2 border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground">
          Métodos de pago disponibles
        </p>

        <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
          <div>
            <p className="font-medium">
              Culqi
            </p>
            <p className="text-xs text-muted-foreground">
              Tarjeta, Yape y billeteras digitales.
            </p>
          </div>
          <Switch
            checked={settings.culqiPaymentsEnabled}
            onCheckedChange={(checked) =>
              onChange(
                "culqiPaymentsEnabled",
                checked
              )
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
          <div>
            <p className="font-medium">
              Pago manual
            </p>
            <p className="text-xs text-muted-foreground">
              Revisión administrativa de comprobantes.
            </p>
          </div>
          <Switch
            checked={settings.manualPaymentsEnabled}
            onCheckedChange={(checked) =>
              onChange(
                "manualPaymentsEnabled",
                checked
              )
            }
          />
        </div>

        {!settings.culqiPaymentsEnabled &&
          !settings.manualPaymentsEnabled && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Debe quedar activo al menos un método de pago para que los
              estudiantes puedan comprar cursos.
            </p>
          )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-muted-foreground">
          Precio final para estudiante
        </span>
        <span className="font-semibold">
          {formatCurrency(breakdown.totalAmount)}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        disabled={
          isSaving ||
          (!settings.culqiPaymentsEnabled &&
            !settings.manualPaymentsEnabled)
        }
        onClick={onSave}
      >
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar configuración
      </Button>

      {!settings.passProcessingFeeToStudent && (
        <p className="mt-2 text-xs text-muted-foreground">
          El estudiante paga el precio del curso; NovaLearn
          absorbe la comisión configurada.
        </p>
      )}

    </div>
  );
}

interface PriceBreakdown {
  subtotalAmount: number;
  processingFeeAmount: number;
  totalAmount: number;
}

function calculatePriceBreakdown(
  price: number,
  settings: PaymentSettings | null
): PriceBreakdown {
  const subtotalAmount = normalizeMoney(price);
  const processingFeeAmount = normalizeMoney(
    subtotalAmount *
      ((settings?.processingFeePercentage ?? 0) / 100)
  );
  const totalAmount = settings?.passProcessingFeeToStudent
    ? normalizeMoney(
        subtotalAmount + processingFeeAmount
      )
    : subtotalAmount;

  return {
    subtotalAmount,
    processingFeeAmount,
    totalAmount,
  };
}

function normalizeMoney(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function parseNumberInput(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatNumberInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return String(value);
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
