"use client";

import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  GripVertical,
  ListChecks,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  QuizDraft,
  QuizOptionDraft,
  QuizQuestionDraft,
  QuizSettingDraft,
} from "@/features/instructor-content/types/instructor-content.types";

interface QuizDraftEditorProps {
  value: QuizDraft;
  disabled?: boolean;
  onChange: (value: QuizDraft) => void;
}

export function QuizDraftEditor({
  value,
  disabled = false,
  onChange,
}: QuizDraftEditorProps) {
  const [expandedQuestions, setExpandedQuestions] =
    useState<Set<string>>(
      () => new Set()
    );

  function updateSettings<
    Key extends keyof QuizSettingDraft
  >(
    field: Key,
    fieldValue: QuizSettingDraft[Key]
  ): void {
    onChange({
      ...value,
      settings: {
        ...value.settings,
        [field]: fieldValue,
      },
    });
  }

  function addQuestion(): void {
    const newQuestion =
      createEmptyQuestion(
        value.questions.length + 1
      );

    onChange({
      ...value,
      questions: [
        ...value.questions,
        newQuestion,
      ],
    });

    setExpandedQuestions(
      (current) => {
        const next = new Set(current);
        next.add(newQuestion.clientId);
        return next;
      }
    );
  }

  function updateQuestion(
    questionId: string,
    updater: (
      question: QuizQuestionDraft
    ) => QuizQuestionDraft
  ): void {
    onChange({
      ...value,
      questions: value.questions.map(
        (question) =>
          question.clientId === questionId
            ? updater(question)
            : question
      ),
    });
  }

  function removeQuestion(
    questionId: string
  ): void {
    const remainingQuestions =
      value.questions
        .filter(
          (question) =>
            question.clientId !== questionId
        )
        .map(
          (question, index) => ({
            ...question,
            sortOrder: index + 1,
          })
        );

    onChange({
      ...value,
      questions: remainingQuestions,
    });

    setExpandedQuestions(
      (current) => {
        const next = new Set(current);
        next.delete(questionId);
        return next;
      }
    );
  }

  function moveQuestion(
    questionId: string,
    direction: "up" | "down"
  ): void {
    const currentIndex =
      value.questions.findIndex(
        (question) =>
          question.clientId === questionId
      );

    if (currentIndex < 0) {
      return;
    }

    const destinationIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      destinationIndex < 0 ||
      destinationIndex >=
        value.questions.length
    ) {
      return;
    }

    const reordered = [
      ...value.questions,
    ];

    const [question] =
      reordered.splice(currentIndex, 1);

    reordered.splice(
      destinationIndex,
      0,
      question
    );

    onChange({
      ...value,
      questions: reordered.map(
        (item, index) => ({
          ...item,
          sortOrder: index + 1,
        })
      ),
    });
  }

  function toggleQuestion(
    questionId: string
  ): void {
    setExpandedQuestions(
      (current) => {
        const next = new Set(current);

        if (next.has(questionId)) {
          next.delete(questionId);
        } else {
          next.add(questionId);
        }

        return next;
      }
    );
  }

  function addOption(
    questionId: string
  ): void {
    updateQuestion(
      questionId,
      (question) => ({
        ...question,
        options: [
          ...question.options,
          createEmptyOption(
            question.options.length + 1
          ),
        ],
      })
    );
  }

  function updateOption(
    questionId: string,
    optionId: string,
    updater: (
      option: QuizOptionDraft
    ) => QuizOptionDraft
  ): void {
    updateQuestion(
      questionId,
      (question) => ({
        ...question,
        options: question.options.map(
          (option) =>
            option.clientId === optionId
              ? updater(option)
              : option
        ),
      })
    );
  }

  function selectCorrectOption(
    questionId: string,
    optionId: string
  ): void {
    updateQuestion(
      questionId,
      (question) => ({
        ...question,
        options: question.options.map(
          (option) => ({
            ...option,
            correct:
              option.clientId === optionId,
          })
        ),
      })
    );
  }

  function removeOption(
    questionId: string,
    optionId: string
  ): void {
    updateQuestion(
      questionId,
      (question) => ({
        ...question,
        options: question.options
          .filter(
            (option) =>
              option.clientId !== optionId
          )
          .map(
            (option, index) => ({
              ...option,
              sortOrder: index + 1,
            })
          ),
      })
    );
  }

  const totalPoints =
    value.questions.reduce(
      (total, question) =>
        total + question.points,
      0
    );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border">
        <div className="flex items-start gap-3 border-b bg-muted/30 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings2 className="size-5" />
          </div>

          <div>
            <h3 className="font-semibold">
              Configuración del cuestionario
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Define las reglas que se aplicarán
              cuando el estudiante realice la
              evaluación.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="quiz-passing-grade"
              >
                Nota mínima aprobatoria
              </label>

              <div className="relative">
                <Input
                  id="quiz-passing-grade"
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  value={
                    value.settings.passingScore / 5
                  }
                  className="pr-16"
                  disabled={disabled}
                  onChange={(event) =>
                    updateSettings(
                      "passingScore",
                      clampNumber(
                        event.target.value,
                        0,
                        20
                      ) * 5
                    )
                  }
                />

                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
                  / 20
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Equivale al{" "}
                  <span className="font-semibold text-foreground">
                    {value.settings.passingScore} %
                  </span>{" "}
                  del puntaje total del cuestionario.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="quiz-max-attempts"
              >
                Intentos permitidos
              </label>

              <Input
                id="quiz-max-attempts"
                type="number"
                min={1}
                max={20}
                step={1}
                value={
                  value.settings.maxAttempts
                }
                disabled={disabled}
                onChange={(event) =>
                  updateSettings(
                    "maxAttempts",
                    clampNumber(
                      event.target.value,
                      1,
                      20
                    )
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Cantidad máxima de intentos por
                estudiante.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuizSettingToggle
              checked={
                value.settings.shuffleQuestions
              }
              disabled={disabled}
              title="Mezclar preguntas"
              description="Presenta las preguntas en un orden diferente."
              onCheckedChange={(checked) =>
                updateSettings(
                  "shuffleQuestions",
                  checked
                )
              }
            />

            <QuizSettingToggle
              checked={
                value.settings.shuffleOptions
              }
              disabled={disabled}
              title="Mezclar alternativas"
              description="Cambia el orden de las respuestas en cada intento."
              onCheckedChange={(checked) =>
                updateSettings(
                  "shuffleOptions",
                  checked
                )
              }
            />

            <QuizSettingToggle
              checked={
                value.settings.showResult
              }
              disabled={disabled}
              title="Mostrar resultado"
              description="Muestra la calificación después de enviar."
              onCheckedChange={(checked) =>
                updateSettings(
                  "showResult",
                  checked
                )
              }
            />

            <QuizSettingToggle
              checked={
                value.settings.showCorrectAnswers
              }
              disabled={
                disabled ||
                !value.settings.showResult
              }
              title="Mostrar respuestas correctas"
              description="Permite revisar las soluciones después del intento."
              onCheckedChange={(checked) =>
                updateSettings(
                  "showCorrectAnswers",
                  checked
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border">
        <div className="flex flex-col gap-4 border-b bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListChecks className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold">
                Preguntas
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {value.questions.length}{" "}
                {value.questions.length === 1
                  ? "pregunta"
                  : "preguntas"}
                {" · "}
                {totalPoints}{" "}
                {totalPoints === 1
                  ? "punto"
                  : "puntos"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            disabled={disabled}
            onClick={addQuestion}
          >
            <Plus className="mr-2 size-4" />
            Agregar pregunta
          </Button>
        </div>

        <div className="space-y-4 p-5">
          {value.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <CirclePlus className="size-6 text-muted-foreground" />
              </div>

              <h4 className="mt-4 font-medium">
                Todavía no hay preguntas
              </h4>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Agrega la primera pregunta y define
                sus alternativas. Cada pregunta debe
                tener exactamente una respuesta
                correcta.
              </p>

              <Button
                type="button"
                className="mt-5"
                variant="outline"
                disabled={disabled}
                onClick={addQuestion}
              >
                <Plus className="mr-2 size-4" />
                Crear primera pregunta
              </Button>
            </div>
          ) : (
            value.questions.map(
              (question, questionIndex) => {
                const isExpanded =
                  expandedQuestions.has(
                    question.clientId
                  );

                return (
                  <article
                    key={question.clientId}
                    className="overflow-hidden rounded-xl border"
                  >
                    <div className="flex items-center gap-2 bg-muted/20 px-3 py-3">
                      <GripVertical className="size-4 shrink-0 text-muted-foreground" />

                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() =>
                          toggleQuestion(
                            question.clientId
                          )
                        }
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {questionIndex + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {question.questionText.trim() ||
                              `Pregunta ${questionIndex + 1}`}
                          </span>

                          <span className="block text-xs text-muted-foreground">
                            {question.options.length}{" "}
                            alternativas ·{" "}
                            {question.points}{" "}
                            {question.points === 1
                              ? "punto"
                              : "puntos"}
                          </span>
                        </span>

                        {isExpanded ? (
                          <ChevronUp className="size-4 shrink-0" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0" />
                        )}
                      </button>

                      <div className="flex shrink-0 items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={
                            disabled ||
                            questionIndex === 0
                          }
                          aria-label="Mover pregunta hacia arriba"
                          onClick={() =>
                            moveQuestion(
                              question.clientId,
                              "up"
                            )
                          }
                        >
                          <ChevronUp className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={
                            disabled ||
                            questionIndex ===
                              value.questions.length -
                                1
                          }
                          aria-label="Mover pregunta hacia abajo"
                          onClick={() =>
                            moveQuestion(
                              question.clientId,
                              "down"
                            )
                          }
                        >
                          <ChevronDown className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={disabled}
                          className="text-destructive hover:text-destructive"
                          aria-label="Eliminar pregunta"
                          onClick={() =>
                            removeQuestion(
                              question.clientId
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-5 border-t p-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Enunciado
                          </label>

                          <Textarea
                            value={
                              question.questionText
                            }
                            rows={3}
                            maxLength={2000}
                            disabled={disabled}
                            placeholder="Escribe la pregunta que deberá responder el estudiante."
                            onChange={(event) =>
                              updateQuestion(
                                question.clientId,
                                (current) => ({
                                  ...current,
                                  questionText:
                                    event.target
                                      .value,
                                })
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Puntaje
                            </label>

                            <Input
                              type="number"
                              min={1}
                              max={1000}
                              step={1}
                              value={
                                question.points
                              }
                              disabled={disabled}
                              onChange={(event) =>
                                updateQuestion(
                                  question.clientId,
                                  (current) => ({
                                    ...current,
                                    points:
                                      clampNumber(
                                        event.target
                                          .value,
                                        1,
                                        1000
                                      ),
                                  })
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Orden
                            </label>

                            <Input
                              value={
                                question.sortOrder
                              }
                              disabled
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Explicación opcional
                          </label>

                          <Textarea
                            value={
                              question.explanation
                            }
                            rows={2}
                            maxLength={2000}
                            disabled={disabled}
                            placeholder="Explica por qué la respuesta seleccionada es correcta."
                            onChange={(event) =>
                              updateQuestion(
                                question.clientId,
                                (current) => ({
                                  ...current,
                                  explanation:
                                    event.target
                                      .value,
                                })
                              )
                            }
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h5 className="text-sm font-medium">
                                Alternativas
                              </h5>

                              <p className="text-xs text-muted-foreground">
                                Marca una sola
                                respuesta como
                                correcta.
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={disabled}
                              onClick={() =>
                                addOption(
                                  question.clientId
                                )
                              }
                            >
                              <Plus className="mr-2 size-4" />
                              Agregar alternativa
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <div
                                  key={
                                    option.clientId
                                  }
                                  className={[
                                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                                    option.correct
                                      ? "border-primary bg-primary/5"
                                      : "",
                                  ].join(" ")}
                                >
                                  <label className="mt-2 flex shrink-0 cursor-pointer items-center">
                                    <input
                                      type="radio"
                                      name={`correct-${question.clientId}`}
                                      checked={
                                        option.correct
                                      }
                                      disabled={
                                        disabled
                                      }
                                      className="size-4"
                                      aria-label={`Marcar alternativa ${optionIndex + 1} como correcta`}
                                      onChange={() =>
                                        selectCorrectOption(
                                          question.clientId,
                                          option.clientId
                                        )
                                      }
                                    />
                                  </label>

                                  <div className="min-w-0 flex-1">
                                    <Input
                                      value={
                                        option.optionText
                                      }
                                      maxLength={
                                        1000
                                      }
                                      disabled={
                                        disabled
                                      }
                                      placeholder={`Alternativa ${optionIndex + 1}`}
                                      onChange={(
                                        event
                                      ) =>
                                        updateOption(
                                          question.clientId,
                                          option.clientId,
                                          (
                                            current
                                          ) => ({
                                            ...current,
                                            optionText:
                                              event
                                                .target
                                                .value,
                                          })
                                        )
                                      }
                                    />

                                    {option.correct && (
                                      <p className="mt-1 text-xs font-medium text-primary">
                                        Respuesta
                                        correcta
                                      </p>
                                    )}
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                      disabled ||
                                      question.options
                                        .length <= 2
                                    }
                                    className="shrink-0 text-destructive hover:text-destructive"
                                    aria-label="Eliminar alternativa"
                                    onClick={() =>
                                      removeOption(
                                        question.clientId,
                                        option.clientId
                                      )
                                    }
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )
          )}
        </div>
      </section>
    </div>
  );
}

interface QuizSettingToggleProps {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onCheckedChange: (
    checked: boolean
  ) => void;
}

function QuizSettingToggle({
  checked,
  disabled = false,
  title,
  description,
  onCheckedChange,
}: QuizSettingToggleProps) {
  return (
    <label
      className={[
        "flex items-start gap-3 rounded-xl border p-4 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-muted/30",
        checked
          ? "border-primary/50 bg-primary/5"
          : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        onChange={(event) =>
          onCheckedChange(
            event.target.checked
          )
        }
      />

      <span
        className={[
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked
            ? "bg-primary"
            : "bg-muted-foreground/30",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 size-4 rounded-full bg-background shadow-sm transition-transform",
            checked
              ? "translate-x-6"
              : "translate-x-1",
          ].join(" ")}
        />
      </span>

      <span>
        <span className="block text-sm font-medium">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function createEmptyQuestion(
  sortOrder: number
): QuizQuestionDraft {
  const firstOption =
    createEmptyOption(1);

  const secondOption =
    createEmptyOption(2);

  firstOption.correct = true;

  return {
    clientId: createClientId(),
    questionText: "",
    points: 1,
    explanation: "",
    sortOrder,
    active: true,
    options: [
      firstOption,
      secondOption,
    ],
  };
}

function createEmptyOption(
  sortOrder: number
): QuizOptionDraft {
  return {
    clientId: createClientId(),
    optionText: "",
    correct: false,
    sortOrder,
  };
}

function createClientId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}

function clampNumber(
  value: string,
  minimum: number,
  maximum: number
): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return minimum;
  }

  return Math.min(
    Math.max(
      Math.trunc(parsedValue),
      minimum
    ),
    maximum
  );
}