"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
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
  EvaluationOptionRequest,
  EvaluationQuestion,
  EvaluationQuestionRequest,
  EvaluationQuestionType,
} from "@/features/evaluations/types/evaluation-question.types";

interface EvaluationQuestionFormDialogProps {
  open: boolean;
  question: EvaluationQuestion | null;
  suggestedSortOrder: number;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    request: EvaluationQuestionRequest
  ) => Promise<void>;
}

interface QuestionFormState {
  questionType: EvaluationQuestionType;
  prompt: string;
  explanation: string;
  points: string;
  sortOrder: string;
  required: boolean;
  options: EvaluationOptionRequest[];
}

interface QuestionFormErrors {
  prompt?: string;
  points?: string;
  sortOrder?: string;
  options?: string;
}

export function EvaluationQuestionFormDialog({
  open,
  question,
  suggestedSortOrder,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: EvaluationQuestionFormDialogProps) {
  const formKey = question
    ? `question-${question.id}`
    : `new-question-${suggestedSortOrder}`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      {open && (
        <QuestionFormContent
          key={formKey}
          question={question}
          suggestedSortOrder={suggestedSortOrder}
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

interface QuestionFormContentProps {
  question: EvaluationQuestion | null;
  suggestedSortOrder: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (
    request: EvaluationQuestionRequest
  ) => Promise<void>;
}

function QuestionFormContent({
  question,
  suggestedSortOrder,
  isSubmitting,
  onCancel,
  onSubmit,
}: QuestionFormContentProps) {
  const [form, setForm] =
    useState<QuestionFormState>(() =>
      createInitialForm(
        question,
        suggestedSortOrder
      )
    );

  const [errors, setErrors] =
    useState<QuestionFormErrors>({});

  const usesOptions =
    form.questionType !==
    "SHORT_ANSWER";

  const isTrueFalse =
    form.questionType ===
    "TRUE_FALSE";

  const correctCount =
    useMemo(
      () =>
        form.options.filter(
          (option) => option.correct
        ).length,
      [form.options]
    );

  function handleQuestionTypeChange(
    questionType: EvaluationQuestionType
  ): void {
    setErrors({});

    setForm((current) => ({
      ...current,
      questionType,
      options:
        questionType === "SHORT_ANSWER"
          ? []
          : questionType === "TRUE_FALSE"
          ? [
              {
                optionText: "Verdadero",
                correct: true,
                sortOrder: 1,
              },
              {
                optionText: "Falso",
                correct: false,
                sortOrder: 2,
              },
            ]
          : current.options.length >= 2
          ? current.options
          : createDefaultOptions(),
    }));
  }

  function addOption(): void {
    setForm((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          optionText: "",
          correct: false,
          sortOrder:
            current.options.length + 1,
        },
      ],
    }));
  }

  function updateOption(
    index: number,
    patch: Partial<EvaluationOptionRequest>
  ): void {
    setForm((current) => ({
      ...current,
      options: current.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                ...patch,
              }
            : option
      ),
    }));
  }

  function setCorrectOption(
    index: number,
    checked: boolean
  ): void {
    if (
      form.questionType ===
        "SINGLE_CHOICE" ||
      form.questionType ===
        "TRUE_FALSE"
    ) {
      setForm((current) => ({
        ...current,
        options: current.options.map(
          (option, optionIndex) => ({
            ...option,
            correct:
              checked &&
              optionIndex === index,
          })
        ),
      }));

      return;
    }

    updateOption(index, {
      correct: checked,
    });
  }

  function removeOption(
    index: number
  ): void {
    setForm((current) => ({
      ...current,
      options: current.options
        .filter(
          (_, optionIndex) =>
            optionIndex !== index
        )
        .map((option, optionIndex) => ({
          ...option,
          sortOrder: optionIndex + 1,
        })),
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
      questionType:
        form.questionType,
      prompt: form.prompt.trim(),
      explanation:
        normalizeOptionalText(
          form.explanation
        ),
      points: Number(form.points),
      sortOrder: Number(
        form.sortOrder
      ),
      required: form.required,
      options: usesOptions
        ? form.options.map(
            (option, index) => ({
              optionText:
                option.optionText.trim(),
              correct:
                option.correct,
              sortOrder: index + 1,
            })
          )
        : [],
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
            {question
              ? "Editar pregunta"
              : "Nueva pregunta"}
          </DialogTitle>
          <DialogDescription>
            Configura el enunciado,
            puntaje y respuestas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo de pregunta">
            <select
              value={form.questionType}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) =>
                handleQuestionTypeChange(
                  event.target
                    .value as EvaluationQuestionType
                )
              }
            >
              <option value="SINGLE_CHOICE">
                Opción única
              </option>
              <option value="MULTIPLE_CHOICE">
                Opción múltiple
              </option>
              <option value="TRUE_FALSE">
                Verdadero o falso
              </option>
              <option value="SHORT_ANSWER">
                Respuesta corta
              </option>
            </select>
          </Field>

          <Field
            label="Puntaje"
            error={errors.points}
          >
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.points}
              disabled={isSubmitting}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  points:
                    event.target.value,
                }))
              }
            />
          </Field>

          <Field
            label="Orden"
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
        </div>

        <Field
          label="Enunciado"
          error={errors.prompt}
        >
          <Textarea
            value={form.prompt}
            rows={4}
            disabled={isSubmitting}
            placeholder="Escribe la pregunta..."
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                prompt:
                  event.target.value,
              }))
            }
          />
        </Field>

        <Field label="Explicación">
          <Textarea
            value={form.explanation}
            rows={3}
            disabled={isSubmitting}
            placeholder="Explicación opcional que podrá mostrarse después de responder."
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                explanation:
                  event.target.value,
              }))
            }
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.required}
            disabled={isSubmitting}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                required:
                  event.target.checked,
              }))
            }
          />
          Pregunta obligatoria
        </label>

        {usesOptions && (
          <section className="space-y-4 rounded-xl border p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Alternativas
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.questionType ===
                  "MULTIPLE_CHOICE"
                    ? "Puedes marcar varias respuestas correctas."
                    : "Marca exactamente una respuesta correcta."}
                </p>
              </div>

              {!isTrueFalse && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={addOption}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar alternativa
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {form.options.map(
                (option, index) => (
                  <div
                    key={`${index}-${option.sortOrder}`}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <input
                      type={
                        form.questionType ===
                        "MULTIPLE_CHOICE"
                          ? "checkbox"
                          : "radio"
                      }
                      name="correct-option"
                      checked={option.correct}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setCorrectOption(
                          index,
                          event.target.checked
                        )
                      }
                      aria-label={`Marcar alternativa ${index + 1} como correcta`}
                    />

                    <Input
                      value={option.optionText}
                      disabled={
                        isSubmitting ||
                        isTrueFalse
                      }
                      placeholder={`Alternativa ${index + 1}`}
                      onChange={(event) =>
                        updateOption(index, {
                          optionText:
                            event.target.value,
                        })
                      }
                    />

                    {!isTrueFalse && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={
                          isSubmitting ||
                          form.options.length <= 2
                        }
                        onClick={() =>
                          removeOption(index)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          Eliminar alternativa
                        </span>
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Respuestas correctas marcadas:{" "}
              {correctCount}
            </p>

            {errors.options && (
              <p className="text-sm text-destructive">
                {errors.options}
              </p>
            )}
          </section>
        )}

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
            {question
              ? "Guardar cambios"
              : "Crear pregunta"}
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

function createInitialForm(
  question: EvaluationQuestion | null,
  suggestedSortOrder: number
): QuestionFormState {
  if (question) {
    return {
      questionType:
        question.questionType,
      prompt: question.prompt,
      explanation:
        question.explanation ?? "",
      points: String(question.points),
      sortOrder: String(
        question.sortOrder
      ),
      required: question.required,
      options:
        question.options.map(
          (option) => ({
            optionText:
              option.optionText,
            correct:
              option.correct,
            sortOrder:
              option.sortOrder,
          })
        ),
    };
  }

  return {
    questionType: "SINGLE_CHOICE",
    prompt: "",
    explanation: "",
    points: "1",
    sortOrder: String(
      suggestedSortOrder
    ),
    required: true,
    options: createDefaultOptions(),
  };
}

function createDefaultOptions(): EvaluationOptionRequest[] {
  return [
    {
      optionText: "",
      correct: true,
      sortOrder: 1,
    },
    {
      optionText: "",
      correct: false,
      sortOrder: 2,
    },
  ];
}

function validateForm(
  form: QuestionFormState
): QuestionFormErrors {
  const errors: QuestionFormErrors =
    {};

  if (!form.prompt.trim()) {
    errors.prompt =
      "El enunciado es obligatorio.";
  }

  const points =
    Number(form.points);

  if (
    !Number.isFinite(points) ||
    points <= 0
  ) {
    errors.points =
      "El puntaje debe ser mayor que cero.";
  }

  const sortOrder =
    Number(form.sortOrder);

  if (
    !Number.isInteger(sortOrder) ||
    sortOrder <= 0
  ) {
    errors.sortOrder =
      "El orden debe ser un entero mayor que cero.";
  }

  if (
    form.questionType ===
    "SHORT_ANSWER"
  ) {
    return errors;
  }

  if (form.options.length < 2) {
    errors.options =
      "Debes registrar al menos dos alternativas.";
    return errors;
  }

  if (
    form.options.some(
      (option) =>
        !option.optionText.trim()
    )
  ) {
    errors.options =
      "Todas las alternativas deben tener texto.";
    return errors;
  }

  const correctCount =
    form.options.filter(
      (option) => option.correct
    ).length;

  if (
    form.questionType ===
      "SINGLE_CHOICE" &&
    correctCount !== 1
  ) {
    errors.options =
      "Debes marcar exactamente una respuesta correcta.";
  }

  if (
    form.questionType ===
      "MULTIPLE_CHOICE" &&
    correctCount < 1
  ) {
    errors.options =
      "Debes marcar al menos una respuesta correcta.";
  }

  if (
    form.questionType ===
      "TRUE_FALSE" &&
    (
      form.options.length !== 2 ||
      correctCount !== 1
    )
  ) {
    errors.options =
      "Verdadero o falso debe tener dos alternativas y una correcta.";
  }

  return errors;
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