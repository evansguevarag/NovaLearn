"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  FileQuestion,
  FileUp,
  Loader2,
  Save,
  TextCursorInput,
  Workflow,
} from "lucide-react";

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
  Evaluation,
  EvaluationDeliveryMode,
  EvaluationRequest,
  EvaluationStatus,
  EvaluationType,
} from "@/features/evaluations/types/evaluation.types";
import type {
  InstructorCourseModule,
} from "@/features/instructor-content/types/instructor-content.types";

interface EvaluationFormDialogProps {
  open: boolean;
  evaluation: Evaluation | null;
  modules: InstructorCourseModule[];
  initialModuleId: number | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    request: EvaluationRequest
  ) => Promise<void>;
}

interface EvaluationFormState {
  moduleId: string;
  title: string;
  description: string;
  instructions: string;
  evaluationType: EvaluationType;
  deliveryMode: EvaluationDeliveryMode;
  status: EvaluationStatus;
  availableFrom: string;
  dueAt: string;
  timeLimitMinutes: string;
  maxAttempts: string;
  maxScore: string;
  passingScore: string;
  shuffleQuestions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowLateSubmission: boolean;
  maxFiles: string;
  maxFileSizeMb: string;
  allowedFileExtensions: string;
  visibleInContent: boolean;
  sortOrder: string;
}

interface EvaluationFormErrors {
  moduleId?: string;
  title?: string;
  dates?: string;
  timeLimitMinutes?: string;
  maxAttempts?: string;
  maxScore?: string;
  passingScore?: string;
  maxFiles?: string;
  maxFileSizeMb?: string;
  sortOrder?: string;
}

const TYPE_OPTIONS: Array<{
  value: EvaluationType;
  label: string;
  defaultMode: EvaluationDeliveryMode;
}> = [
  {
    value: "QUIZ",
    label: "Quiz",
    defaultMode: "ONLINE_QUIZ",
  },
  {
    value: "PRACTICE",
    label: "Práctica calificada",
    defaultMode: "FILE_SUBMISSION",
  },
  {
    value: "MIDTERM",
    label: "Examen parcial",
    defaultMode: "ONLINE_QUIZ",
  },
  {
    value: "FINAL_EXAM",
    label: "Examen final",
    defaultMode: "ONLINE_QUIZ",
  },
];

const DELIVERY_OPTIONS: Array<{
  value: EvaluationDeliveryMode;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: "ONLINE_QUIZ",
    label: "Cuestionario en línea",
    description:
      "Preguntas, alternativas, temporizador e intentos dentro de NovaLearn.",
    icon: FileQuestion,
  },
  {
    value: "TEXT_SUBMISSION",
    label: "Respuesta escrita",
    description:
      "El estudiante redacta su respuesta directamente en la plataforma.",
    icon: TextCursorInput,
  },
  {
    value: "FILE_SUBMISSION",
    label: "Entrega de archivos",
    description:
      "El estudiante adjunta uno o más archivos como respuesta.",
    icon: FileUp,
  },
  {
    value: "HYBRID",
    label: "Modalidad híbrida",
    description:
      "Permite respuesta escrita y archivos adjuntos.",
    icon: Workflow,
  },
];

export function EvaluationFormDialog({
  open,
  evaluation,
  modules,
  initialModuleId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: EvaluationFormDialogProps) {
  const formKey = evaluation
    ? `evaluation-${evaluation.id}`
    : `new-evaluation-${initialModuleId ?? "manual"}`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      {open && (
        <EvaluationFormContent
          key={formKey}
          evaluation={evaluation}
          modules={modules}
          initialModuleId={initialModuleId}
          isSubmitting={isSubmitting}
          onCancel={() =>
            onOpenChange(false)
          }
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

interface EvaluationFormContentProps {
  evaluation: Evaluation | null;
  modules: InstructorCourseModule[];
  initialModuleId: number | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (
    request: EvaluationRequest
  ) => Promise<void>;
}

function EvaluationFormContent({
  evaluation,
  modules,
  initialModuleId,
  isSubmitting,
  onCancel,
  onSubmit,
}: EvaluationFormContentProps) {
  const [form, setForm] =
    useState<EvaluationFormState>(() =>
      createInitialForm(
        evaluation,
        modules,
        initialModuleId
      )
    );

  const [errors, setErrors] =
    useState<EvaluationFormErrors>({});

  const isOnlineQuiz =
    form.deliveryMode ===
    "ONLINE_QUIZ";

  const acceptsFiles =
    form.deliveryMode ===
      "FILE_SUBMISSION" ||
    form.deliveryMode ===
      "HYBRID";

  const usesSubmission =
    form.deliveryMode !==
    "ONLINE_QUIZ";

  const selectedDelivery =
    useMemo(
      () =>
        DELIVERY_OPTIONS.find(
          (option) =>
            option.value ===
            form.deliveryMode
        ),
      [form.deliveryMode]
    );
function handleTypeChange(
    evaluationType: EvaluationType
  ): void {
    setErrors({});
    const selectedType =
      TYPE_OPTIONS.find(
        (option) =>
          option.value ===
          evaluationType
      );

    const defaultMode =
      selectedType?.defaultMode ??
      "ONLINE_QUIZ";

    setForm((current) => ({
      ...current,
      evaluationType,
      deliveryMode: defaultMode,
      maxAttempts:
        evaluationType ===
          "MIDTERM" ||
        evaluationType ===
          "FINAL_EXAM"
          ? "1"
          : current.maxAttempts,
      showCorrectAnswers:
        evaluationType ===
          "MIDTERM" ||
        evaluationType ===
          "FINAL_EXAM"
          ? false
          : current.showCorrectAnswers,
      showResults:
        evaluationType ===
          "FINAL_EXAM"
          ? false
          : current.showResults,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const validationErrors =
      validateForm(form);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    await onSubmit({
      moduleId: Number(
        form.moduleId
      ),
      title: form.title.trim(),
      description:
        normalizeOptionalText(
          form.description
        ),
      instructions:
        normalizeOptionalText(
          form.instructions
        ),
      evaluationType:
        form.evaluationType,
      deliveryMode:
        form.deliveryMode,
      status: form.status,
      availableFrom:
        toApiDateTime(
          form.availableFrom
        ),
      dueAt:
        toApiDateTime(form.dueAt),
      timeLimitMinutes:
        isOnlineQuiz &&
        form.timeLimitMinutes
          ? Number(
              form.timeLimitMinutes
            )
          : null,
      maxAttempts: Number(
        form.maxAttempts
      ),
      maxScore: Number(
        form.maxScore
      ),
      passingScore:
        form.passingScore
          ? Number(
              form.passingScore
            )
          : null,
      shuffleQuestions:
        isOnlineQuiz
          ? form.shuffleQuestions
          : false,
      showResults:
        form.showResults,
      showCorrectAnswers:
        isOnlineQuiz
          ? form.showCorrectAnswers
          : false,
      allowLateSubmission:
        usesSubmission
          ? form.allowLateSubmission
          : false,
      maxFiles:
        acceptsFiles
          ? Number(form.maxFiles)
          : null,
      maxFileSizeMb:
        acceptsFiles
          ? Number(
              form.maxFileSizeMb
            )
          : null,
      allowedFileExtensions:
        acceptsFiles
          ? normalizeOptionalText(
              form.allowedFileExtensions
            )
          : null,
      visibleInContent:
        form.visibleInContent,
      sortOrder: Number(
        form.sortOrder
      ),
    });
  }

  return (
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      <form
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        <DialogHeader>
          <DialogTitle>
            {evaluation
              ? "Editar evaluación"
              : "Nueva evaluación"}
          </DialogTitle>

          <DialogDescription>
            Configura el tipo académico
            y la modalidad real de
            resolución.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Semana o módulo"
            error={errors.moduleId}
          >
            <select
              value={form.moduleId}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  moduleId:
                    event.target.value,
                }))
              }
            >
              <option value="">
                Selecciona una semana
              </option>

              {modules.map(
                (courseModule) => (
                  <option
                    key={courseModule.id}
                    value={courseModule.id}
                  >
                    Semana{" "}
                    {courseModule.sortOrder}
                    {" · "}
                    {courseModule.title}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Tipo académico">
            <select
              value={
                form.evaluationType
              }
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                handleTypeChange(
                  event.target
                    .value as EvaluationType
                )
              }
            >
              {TYPE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </Field>
        </section>

        <Field
          label="Título"
          error={errors.title}
        >
          <Input
            value={form.title}
            maxLength={255}
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title:
                  event.target.value,
              }))
            }
          />
        </Field>

        <Field label="Descripción breve">
          <Textarea
            value={form.description}
            rows={3}
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description:
                  event.target.value,
              }))
            }
          />
        </Field>

        <Field label="Instrucciones">
          <Textarea
            value={form.instructions}
            rows={6}
            disabled={isSubmitting}
            placeholder={
              isOnlineQuiz
                ? "Indicaciones antes de iniciar el cuestionario."
                : "Explica qué debe entregar el estudiante y cómo será evaluado."
            }
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                instructions:
                  event.target.value,
              }))
            }
          />
        </Field>

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">
              Modalidad de resolución
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              El tipo académico y la
              modalidad son conceptos
              independientes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DELIVERY_OPTIONS.map(
              (option) => {
                const Icon =
                  option.icon;

                const selected =
                  option.value ===
                  form.deliveryMode;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isSubmitting}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                    onClick={() => {
                      setErrors({});
                      setForm(
                        (current) => ({
                          ...current,
                          deliveryMode:
                            option.value,
                        })
                      );
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-medium">
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            option.description
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {selectedDelivery && (
            <p className="text-xs text-muted-foreground">
              Modalidad seleccionada:{" "}
              {selectedDelivery.label}
            </p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Field label="Estado">
            <select
              value={form.status}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status:
                    event.target.value as EvaluationStatus,
                }))
              }
            >
              <option value="DRAFT">
                Borrador
              </option>
              <option value="PUBLISHED">
                Publicada
              </option>
              <option value="CLOSED">
                Cerrada
              </option>
            </select>
          </Field>

          <Field
            label="Orden en la semana"
            error={errors.sortOrder}
          >
            <Input
              type="number"
              min="1"
              value={form.sortOrder}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder:
                    event.target.value,
                }))
              }
            />
          </Field>

          <Field
            label="Intentos máximos"
            error={errors.maxAttempts}
          >
            <Input
              type="number"
              min="1"
              value={form.maxAttempts}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  maxAttempts:
                    event.target.value,
                }))
              }
            />
          </Field>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Disponible desde">
            <Input
              type="datetime-local"
              value={form.availableFrom}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availableFrom:
                    event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Fecha límite">
            <Input
              type="datetime-local"
              value={form.dueAt}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueAt:
                    event.target.value,
                }))
              }
            />
          </Field>
        </section>

        {errors.dates && (
          <p className="text-sm text-destructive">
            {errors.dates}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Puntaje máximo"
            error={errors.maxScore}
          >
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.maxScore}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  maxScore:
                    event.target.value,
                }))
              }
            />
          </Field>

          <Field
            label="Puntaje aprobatorio"
            error={errors.passingScore}
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.passingScore}
              placeholder="Opcional"
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  passingScore:
                    event.target.value,
                }))
              }
            />
          </Field>
        </section>

        {isOnlineQuiz && (
          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h3 className="font-semibold">
                Configuración del cuestionario
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Después de crear la
                evaluación se habilitará
                el editor de preguntas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Tiempo límite (min)"
                error={
                  errors.timeLimitMinutes
                }
              >
                <Input
                  type="number"
                  min="1"
                  value={
                    form.timeLimitMinutes
                  }
                  placeholder="Sin límite"
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        timeLimitMinutes:
                          event.target
                            .value,
                      })
                    )
                  }
                />
              </Field>

              <div className="space-y-3 pt-7">
                <CheckboxField
                  label="Mezclar preguntas"
                  checked={
                    form.shuffleQuestions
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(checked) =>
                    setForm(
                      (current) => ({
                        ...current,
                        shuffleQuestions:
                          checked,
                      })
                    )
                  }
                />

                <CheckboxField
                  label="Mostrar respuestas correctas"
                  checked={
                    form.showCorrectAnswers
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(checked) =>
                    setForm(
                      (current) => ({
                        ...current,
                        showCorrectAnswers:
                          checked,
                      })
                    )
                  }
                />
              </div>
            </div>
          </section>
        )}

        {usesSubmission && (
          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h3 className="font-semibold">
                Configuración de entrega
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajustes aplicables a
                respuestas escritas o
                archivos.
              </p>
            </div>

            <CheckboxField
              label="Permitir entrega tardía"
              checked={
                form.allowLateSubmission
              }
              disabled={isSubmitting}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  allowLateSubmission:
                    checked,
                }))
              }
            />

            {acceptsFiles && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Cantidad máxima de archivos"
                  error={errors.maxFiles}
                >
                  <Input
                    type="number"
                    min="1"
                    value={form.maxFiles}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          maxFiles:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </Field>

                <Field
                  label="Tamaño máximo por archivo (MB)"
                  error={
                    errors.maxFileSizeMb
                  }
                >
                  <Input
                    type="number"
                    min="1"
                    value={
                      form.maxFileSizeMb
                    }
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          maxFileSizeMb:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Extensiones permitidas">
                    <Input
                      value={
                        form.allowedFileExtensions
                      }
                      placeholder="pdf,doc,docx,xlsx,zip"
                      disabled={
                        isSubmitting
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            allowedFileExtensions:
                              event.target
                                .value,
                          })
                        )
                      }
                    />
                  </Field>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-xl border p-5">
          <h3 className="font-semibold">
            Visibilidad y resultados
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CheckboxField
              label="Mostrar dentro de Contenido"
              checked={
                form.visibleInContent
              }
              disabled={isSubmitting}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  visibleInContent:
                    checked,
                }))
              }
            />

            <CheckboxField
              label="Mostrar resultado al estudiante"
              checked={form.showResults}
              disabled={isSubmitting}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  showResults: checked,
                }))
              }
            />
          </div>
        </section>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            {evaluation
              ? "Guardar cambios"
              : "Crear evaluación"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />
      {label}
    </label>
  );
}

function createInitialForm(
  evaluation: Evaluation | null,
  modules: InstructorCourseModule[],
  initialModuleId: number | null
): EvaluationFormState {
  if (evaluation) {
    return {
      moduleId: String(
        evaluation.moduleId
      ),
      title: evaluation.title,
      description:
        evaluation.description ?? "",
      instructions:
        evaluation.instructions ?? "",
      evaluationType:
        evaluation.evaluationType,
      deliveryMode:
        evaluation.deliveryMode,
      status: evaluation.status,
      availableFrom:
        toDateTimeLocal(
          evaluation.availableFrom
        ),
      dueAt:
        toDateTimeLocal(
          evaluation.dueAt
        ),
      timeLimitMinutes:
        evaluation.timeLimitMinutes ===
        null
          ? ""
          : String(
              evaluation.timeLimitMinutes
            ),
      maxAttempts: String(
        evaluation.maxAttempts
      ),
      maxScore: String(
        evaluation.maxScore
      ),
      passingScore:
        evaluation.passingScore === null
          ? ""
          : String(
              evaluation.passingScore
            ),
      shuffleQuestions:
        evaluation.shuffleQuestions,
      showResults:
        evaluation.showResults,
      showCorrectAnswers:
        evaluation.showCorrectAnswers,
      allowLateSubmission:
        evaluation.allowLateSubmission,
      maxFiles:
        evaluation.maxFiles === null
          ? "1"
          : String(
              evaluation.maxFiles
            ),
      maxFileSizeMb:
        evaluation.maxFileSizeMb ===
        null
          ? "20"
          : String(
              evaluation.maxFileSizeMb
            ),
      allowedFileExtensions:
        evaluation.allowedFileExtensions ??
        "pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png",
      visibleInContent:
        evaluation.visibleInContent,
      sortOrder: String(
        evaluation.sortOrder
      ),
    };
  }

  const defaultModuleId =
    initialModuleId ??
    modules[0]?.id ??
    null;

  return {
    moduleId:
      defaultModuleId === null
        ? ""
        : String(defaultModuleId),
    title: "",
    description: "",
    instructions: "",
    evaluationType: "QUIZ",
    deliveryMode: "ONLINE_QUIZ",
    status: "DRAFT",
    availableFrom: "",
    dueAt: "",
    timeLimitMinutes: "",
    maxAttempts: "1",
    maxScore: "20",
    passingScore: "11",
    shuffleQuestions: false,
    showResults: true,
    showCorrectAnswers: false,
    allowLateSubmission: false,
    maxFiles: "1",
    maxFileSizeMb: "20",
    allowedFileExtensions:
      "pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png",
    visibleInContent: true,
    sortOrder: "1",
  };
}

function validateForm(
  form: EvaluationFormState
): EvaluationFormErrors {
  const errors: EvaluationFormErrors =
    {};

  const moduleId =
    Number(form.moduleId);

  if (
    !Number.isInteger(moduleId) ||
    moduleId <= 0
  ) {
    errors.moduleId =
      "Selecciona una semana válida.";
  }

  if (!form.title.trim()) {
    errors.title =
      "El título es obligatorio.";
  }

  const maxAttempts =
    Number(form.maxAttempts);

  if (
    !Number.isInteger(maxAttempts) ||
    maxAttempts <= 0
  ) {
    errors.maxAttempts =
      "Los intentos deben ser un número entero mayor que cero.";
  }

  if (
    form.deliveryMode ===
      "ONLINE_QUIZ" &&
    form.timeLimitMinutes &&
    (
      !Number.isInteger(
        Number(
          form.timeLimitMinutes
        )
      ) ||
      Number(
        form.timeLimitMinutes
      ) <= 0
    )
  ) {
    errors.timeLimitMinutes =
      "El tiempo debe ser un número entero mayor que cero.";
  }

  const maxScore =
    Number(form.maxScore);

  if (
    !Number.isFinite(maxScore) ||
    maxScore <= 0
  ) {
    errors.maxScore =
      "El puntaje máximo debe ser mayor que cero.";
  }

  if (form.passingScore) {
    const passingScore =
      Number(form.passingScore);

    if (
      !Number.isFinite(
        passingScore
      ) ||
      passingScore < 0 ||
      passingScore > maxScore
    ) {
      errors.passingScore =
        "El puntaje aprobatorio debe estar entre 0 y el puntaje máximo.";
    }
  }

  if (
    form.availableFrom &&
    form.dueAt &&
    new Date(form.dueAt) <=
      new Date(
        form.availableFrom
      )
  ) {
    errors.dates =
      "La fecha límite debe ser posterior a la fecha de apertura.";
  }

  if (
    (
      form.deliveryMode ===
        "FILE_SUBMISSION" ||
      form.deliveryMode ===
        "HYBRID"
    ) &&
    (
      !Number.isInteger(
        Number(form.maxFiles)
      ) ||
      Number(form.maxFiles) <= 0
    )
  ) {
    errors.maxFiles =
      "La cantidad máxima de archivos debe ser mayor que cero.";
  }

  if (
    (
      form.deliveryMode ===
        "FILE_SUBMISSION" ||
      form.deliveryMode ===
        "HYBRID"
    ) &&
    (
      !Number.isInteger(
        Number(
          form.maxFileSizeMb
        )
      ) ||
      Number(
        form.maxFileSizeMb
      ) <= 0
    )
  ) {
    errors.maxFileSizeMb =
      "El tamaño máximo debe ser mayor que cero.";
  }

  if (
    !Number.isInteger(
      Number(form.sortOrder)
    ) ||
    Number(form.sortOrder) <= 0
  ) {
    errors.sortOrder =
      "El orden debe ser mayor que cero.";
  }

  return errors;
}

function toDateTimeLocal(
  value: string | null
): string {
  return value
    ? value.slice(0, 16)
    : "";
}

function toApiDateTime(
  value: string
): string | null {
  return value
    ? `${value}:00`
    : null;
}

function normalizeOptionalText(
  value: string
): string | null {
  const normalized =
    value.trim();

  return normalized
    ? normalized
    : null;
}