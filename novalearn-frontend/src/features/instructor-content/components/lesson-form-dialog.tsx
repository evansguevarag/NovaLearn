"use client";

import {
  CircleHelp,
  FileText,
  Loader2,
  MonitorPlay,
  Type,
  Upload,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

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

import { LessonResourceUploader } from "@/features/instructor-content/components/lesson-resource-uploader";
import { QuizDraftEditor } from "@/features/instructor-content/components/quiz-draft-editor";
import type {
  CourseContentContext,
} from "@/features/instructor-content/services/course-content.service";
import type {
  InstructorLesson,
  InstructorLessonRequest,
  LessonType,
  QuizDraft,
  QuizOptionDraft,
  QuizQuestionDraft,
} from "@/features/instructor-content/types/instructor-content.types";

const MAX_PDF_SIZE =
  20 * 1024 * 1024;

interface LessonFormDialogProps {
  open: boolean;
  context: CourseContentContext;
  moduleId: number;
  lesson?: InstructorLesson | null;
  initialQuizDraft?: QuizDraft | null;
  suggestedSortOrder: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    request: InstructorLessonRequest,
    resourceFile: File | null,
    quiz: QuizDraft | null
  ) => Promise<void>;
  onLessonChange: (
    lesson: InstructorLesson
  ) => void;
}

interface LessonFormState {
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  lessonType: LessonType;
  durationMinutes: string;
  sortOrder: string;
  preview: boolean;
  active: boolean;
}

interface LessonFormErrors {
  title?: string;
  content?: string;
  videoUrl?: string;
  resourceFile?: string;
  durationMinutes?: string;
  sortOrder?: string;
  quiz?: string;
}

const LESSON_TYPES: Array<{
  value: LessonType;
  label: string;
  description: string;
}> = [
  {
    value: "VIDEO",
    label: "Video",
    description:
      "Lección basada en un video externo.",
  },
  {
    value: "TEXT",
    label: "Texto",
    description:
      "Contenido académico escrito.",
  },
  {
    value: "RESOURCE",
    label: "Recurso",
    description:
      "Material complementario en formato PDF.",
  },
  {
    value: "QUIZ",
    label: "Cuestionario",
    description:
      "Evaluación con preguntas y alternativas.",
  },
];

export function LessonFormDialog({
  open,
  context,
  moduleId,
  lesson,
  initialQuizDraft,
  suggestedSortOrder,
  onOpenChange,
  onSubmit,
  onLessonChange,
}: LessonFormDialogProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [form, setForm] =
    useState<LessonFormState>(() =>
      createInitialState(
        lesson,
        suggestedSortOrder
      )
    );

  const [quizDraft, setQuizDraft] =
    useState<QuizDraft>(() =>
      initialQuizDraft
        ? cloneQuizDraft(initialQuizDraft)
        : createInitialQuizDraft()
    );

  const [resourceFile, setResourceFile] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<LessonFormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isEditing = Boolean(lesson);

  const selectedType = useMemo(
    () =>
      LESSON_TYPES.find(
        (type) =>
          type.value === form.lessonType
      ),
    [form.lessonType]
  );

  function updateField<
    Key extends keyof LessonFormState
  >(
    field: Key,
    value: LessonFormState[Key]
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    clearFieldError(field);

    if (
      field === "lessonType" &&
      value !== "RESOURCE"
    ) {
      setResourceFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      clearFieldError("resourceFile");
    }

    if (
      field === "lessonType" &&
      value !== "QUIZ"
    ) {
      clearFieldError("quiz");
    }
  }

  function clearFieldError(
    field:
      | keyof LessonFormState
      | keyof LessonFormErrors
  ): void {
    const errorField =
      field as keyof LessonFormErrors;

    setErrors((current) => {
      if (!current[errorField]) {
        return current;
      }

      const nextErrors = {
        ...current,
      };

      delete nextErrors[errorField];

      return nextErrors;
    });
  }

  function handleQuizChange(
    value: QuizDraft
  ): void {
    setQuizDraft(value);
    clearFieldError("quiz");
  }

  function handleResourceFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    const selectedFile =
      event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setResourceFile(null);
      return;
    }

    const validationError =
      validatePdf(selectedFile);

    if (validationError) {
      setErrors((current) => ({
        ...current,
        resourceFile: validationError,
      }));

      setResourceFile(null);
      event.target.value = "";

      return;
    }

    setResourceFile(selectedFile);
    clearFieldError("resourceFile");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const validationErrors =
      validateLessonForm(
        form,
        resourceFile,
        quizDraft,
        isEditing
      );

    if (
      Object.keys(validationErrors).length >
      0
    ) {
      setErrors(validationErrors);
      return;
    }

    const request: InstructorLessonRequest = {
      moduleId,
      title: form.title.trim(),
      description:
        normalizeOptionalText(
          form.description
        ),
      content:
        form.lessonType === "TEXT" ||
        form.lessonType === "RESOURCE"
          ? normalizeOptionalText(
              form.content
            )
          : null,
      videoUrl:
        form.lessonType === "VIDEO"
          ? normalizeOptionalText(
              form.videoUrl
            )
          : null,
      lessonType: form.lessonType,
      durationMinutes: Number(
        form.durationMinutes
      ),
      sortOrder: Number(form.sortOrder),
      preview: form.preview,
      active: form.active,
    };

    try {
      setIsSubmitting(true);

      await onSubmit(
        request,
        form.lessonType === "RESOURCE"
          ? resourceFile
          : null,
        form.lessonType === "QUIZ"
          ? normalizeQuizDraft(quizDraft)
          : null
      );

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
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
      <DialogContent
        className={[
          "max-h-[92vh] overflow-y-auto",
          form.lessonType === "QUIZ"
            ? "sm:max-w-5xl"
            : "sm:max-w-3xl",
        ].join(" ")}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar lección"
              : form.lessonType === "QUIZ"
                ? "Nuevo cuestionario"
                : "Nueva lección"}
          </DialogTitle>

          <DialogDescription>
            {form.lessonType === "QUIZ"
              ? "Configura la información general, las reglas y las preguntas de la evaluación."
              : "Configura el contenido académico que formará parte de este módulo."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="lesson-title"
            >
              Título de la lección
            </label>

            <Input
              id="lesson-title"
              value={form.title}
              maxLength={255}
              placeholder={
                form.lessonType === "QUIZ"
                  ? "Ejemplo: Evaluación del módulo 1"
                  : "Ejemplo: Introducción al curso"
              }
              aria-invalid={Boolean(
                errors.title
              )}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
            />

            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="lesson-description"
            >
              Descripción
            </label>

            <Textarea
              id="lesson-description"
              value={form.description}
              placeholder={
                form.lessonType === "QUIZ"
                  ? "Describe brevemente qué conocimientos serán evaluados."
                  : "Describe brevemente qué aprenderá el estudiante."
              }
              rows={3}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Tipo de lección
            </legend>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LESSON_TYPES.map((type) => {
                const isSelected =
                  form.lessonType ===
                  type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={isSubmitting}
                    className={[
                      "min-h-32 rounded-xl border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/50",
                    ].join(" ")}
                    onClick={() =>
                      updateField(
                        "lessonType",
                        type.value
                      )
                    }
                  >
                    <div className="mb-2 flex items-center gap-2 font-medium">
                      <LessonTypeIcon
                        type={type.value}
                      />

                      {type.label}
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedType && (
              <p className="text-xs text-muted-foreground">
                Tipo seleccionado:{" "}
                {selectedType.label}
              </p>
            )}
          </fieldset>

          {form.lessonType === "VIDEO" && (
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="lesson-video-url"
              >
                URL del video
              </label>

              <Input
                id="lesson-video-url"
                type="url"
                value={form.videoUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-invalid={Boolean(
                  errors.videoUrl
                )}
                onChange={(event) =>
                  updateField(
                    "videoUrl",
                    event.target.value
                  )
                }
              />

              {errors.videoUrl && (
                <p className="text-sm text-destructive">
                  {errors.videoUrl}
                </p>
              )}
            </div>
          )}

          {form.lessonType === "TEXT" && (
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="lesson-content"
              >
                Contenido de la lección
              </label>

              <Textarea
                id="lesson-content"
                value={form.content}
                rows={8}
                placeholder="Escribe el contenido académico de la lección."
                aria-invalid={Boolean(
                  errors.content
                )}
                onChange={(event) =>
                  updateField(
                    "content",
                    event.target.value
                  )
                }
              />

              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content}
                </p>
              )}
            </div>
          )}

          {form.lessonType ===
            "RESOURCE" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="lesson-resource-content"
                >
                  Descripción complementaria
                </label>

                <Textarea
                  id="lesson-resource-content"
                  value={form.content}
                  rows={4}
                  placeholder="Agrega indicaciones o una explicación sobre el recurso."
                  onChange={(event) =>
                    updateField(
                      "content",
                      event.target.value
                    )
                  }
                />
              </div>

              {lesson ? (
                <LessonResourceUploader
                  context={context}
                  lesson={lesson}
                  onLessonChange={
                    onLessonChange
                  }
                />
              ) : (
                <section className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Upload className="size-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">
                        Archivo PDF
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Selecciona el PDF que se
                        asociará automáticamente al
                        crear la lección. Tamaño
                        máximo: 20 MB.
                      </p>
                    </div>
                  </div>

                  <Input
                    ref={fileInputRef}
                    id="lesson-resource-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-invalid={Boolean(
                      errors.resourceFile
                    )}
                    disabled={isSubmitting}
                    onChange={
                      handleResourceFileChange
                    }
                  />

                  {resourceFile && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                      <FileText className="size-5 shrink-0" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {resourceFile.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(
                            resourceFile.size
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.resourceFile && (
                    <p className="text-sm text-destructive">
                      {errors.resourceFile}
                    </p>
                  )}
                </section>
              )}
            </div>
          )}

          {form.lessonType === "QUIZ" && (
            <div className="space-y-3">
              <QuizDraftEditor
                value={quizDraft}
                disabled={isSubmitting}
                onChange={handleQuizChange}
              />

              {errors.quiz && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {errors.quiz}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="lesson-duration"
              >
                {form.lessonType === "QUIZ"
                  ? "Duración estimada"
                  : "Duración estimada"}
              </label>

              <div className="relative">
                <Input
                  id="lesson-duration"
                  type="number"
                  min={0}
                  step={1}
                  value={
                    form.durationMinutes
                  }
                  className="pr-20"
                  aria-invalid={Boolean(
                    errors.durationMinutes
                  )}
                  onChange={(event) =>
                    updateField(
                      "durationMinutes",
                      event.target.value
                    )
                  }
                />

                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  minutos
                </span>
              </div>

              {errors.durationMinutes && (
                <p className="text-sm text-destructive">
                  {errors.durationMinutes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="lesson-sort-order"
              >
                Orden
              </label>

              <Input
                id="lesson-sort-order"
                type="number"
                min={1}
                step={1}
                value={form.sortOrder}
                aria-invalid={Boolean(
                  errors.sortOrder
                )}
                onChange={(event) =>
                  updateField(
                    "sortOrder",
                    event.target.value
                  )
                }
              />

              {errors.sortOrder && (
                <p className="text-sm text-destructive">
                  {errors.sortOrder}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.preview}
                className="mt-1 size-4"
                onChange={(event) =>
                  updateField(
                    "preview",
                    event.target.checked
                  )
                }
              />

              <span>
                <span className="block text-sm font-medium">
                  Vista previa gratuita
                </span>

                <span className="block text-xs text-muted-foreground">
                  El estudiante podrá revisar esta
                  lección antes de matricularse.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.active}
                className="mt-1 size-4"
                onChange={(event) =>
                  updateField(
                    "active",
                    event.target.checked
                  )
                }
              />

              <span>
                <span className="block text-sm font-medium">
                  Lección activa
                </span>

                <span className="block text-xs text-muted-foreground">
                  Permite mostrarla dentro del
                  contenido del curso.
                </span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              {getSubmitLabel(
                isEditing,
                form.lessonType
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function createInitialState(
  lesson: InstructorLesson | null | undefined,
  suggestedSortOrder: number
): LessonFormState {
  if (lesson) {
    return {
      title: lesson.title,
      description:
        lesson.description ?? "",
      content: lesson.content ?? "",
      videoUrl: lesson.videoUrl ?? "",
      lessonType: lesson.lessonType,
      durationMinutes: String(
        lesson.durationMinutes
      ),
      sortOrder: String(
        lesson.sortOrder
      ),
      preview: lesson.preview,
      active: lesson.active,
    };
  }

  return {
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    lessonType: "VIDEO",
    durationMinutes: "0",
    sortOrder: String(
      Math.max(suggestedSortOrder, 1)
    ),
    preview: false,
    active: true,
  };
}

function cloneQuizDraft(
  quizDraft: QuizDraft
): QuizDraft {
  return {
    settings: {
      ...quizDraft.settings,
    },
    questions: quizDraft.questions.map(
      (question) => ({
        ...question,
        options: question.options.map(
          (option) => ({
            ...option,
          })
        ),
      })
    ),
  };
}

function createInitialQuizDraft(): QuizDraft {
  return {
    settings: {
      passingScore: 70,
      maxAttempts: 3,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResult: true,
      showCorrectAnswers: false,
    },
    questions: [],
  };
}

function validateLessonForm(
  form: LessonFormState,
  resourceFile: File | null,
  quizDraft: QuizDraft,
  isEditing: boolean
): LessonFormErrors {
  const errors: LessonFormErrors = {};

  if (!form.title.trim()) {
    errors.title =
      "El título de la lección es obligatorio.";
  }

  if (
    form.lessonType === "VIDEO" &&
    !form.videoUrl.trim()
  ) {
    errors.videoUrl =
      "La URL del video es obligatoria.";
  }

  if (
    form.lessonType === "TEXT" &&
    !form.content.trim()
  ) {
    errors.content =
      "El contenido de la lección es obligatorio.";
  }

  if (
    form.lessonType === "RESOURCE" &&
    !isEditing &&
    !resourceFile
  ) {
    errors.resourceFile =
      "Selecciona el archivo PDF de la lección.";
  }

  const durationMinutes = Number(
    form.durationMinutes
  );

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 0
  ) {
    errors.durationMinutes =
      "La duración debe ser un número entero mayor o igual a 0.";
  }

  const sortOrder = Number(
    form.sortOrder
  );

  if (
    !Number.isInteger(sortOrder) ||
    sortOrder < 1
  ) {
    errors.sortOrder =
      "El orden debe ser un número entero mayor o igual a 1.";
  }

  if (form.lessonType === "QUIZ") {
    const quizError =
      validateQuizDraft(quizDraft);

    if (quizError) {
      errors.quiz = quizError;
    }
  }

  return errors;
}

function validateQuizDraft(
  quizDraft: QuizDraft
): string | null {
  if (
    !Number.isInteger(
      quizDraft.settings.passingScore
    ) ||
    quizDraft.settings.passingScore < 0 ||
    quizDraft.settings.passingScore > 100
  ) {
    return "La nota mínima debe ser un número entero entre 0 y 100.";
  }

  if (
    !Number.isInteger(
      quizDraft.settings.maxAttempts
    ) ||
    quizDraft.settings.maxAttempts < 1
  ) {
    return "La cantidad de intentos debe ser mayor o igual a 1.";
  }

  if (quizDraft.questions.length === 0) {
    return "Agrega al menos una pregunta al cuestionario.";
  }

  for (
    let index = 0;
    index < quizDraft.questions.length;
    index += 1
  ) {
    const question =
      quizDraft.questions[index];

    const questionNumber = index + 1;

    if (!question.questionText.trim()) {
      return `Escribe el enunciado de la pregunta ${questionNumber}.`;
    }

    if (
      !Number.isInteger(question.points) ||
      question.points < 1
    ) {
      return `El puntaje de la pregunta ${questionNumber} debe ser mayor o igual a 1.`;
    }

    if (question.options.length < 2) {
      return `La pregunta ${questionNumber} debe tener al menos dos alternativas.`;
    }

    const normalizedOptions =
      question.options.map(
        (option) =>
          option.optionText
            .trim()
            .toLocaleLowerCase()
      );

    if (
      normalizedOptions.some(
        (optionText) => !optionText
      )
    ) {
      return `Completa todas las alternativas de la pregunta ${questionNumber}.`;
    }

    if (
      new Set(normalizedOptions).size !==
      normalizedOptions.length
    ) {
      return `La pregunta ${questionNumber} contiene alternativas repetidas.`;
    }

    const correctOptions =
      question.options.filter(
        (option) => option.correct
      );

    if (correctOptions.length !== 1) {
      return `La pregunta ${questionNumber} debe tener exactamente una respuesta correcta.`;
    }
  }

  return null;
}

function normalizeQuizDraft(
  quizDraft: QuizDraft
): QuizDraft {
  return {
    settings: {
      ...quizDraft.settings,
      showCorrectAnswers:
        quizDraft.settings.showResult &&
        quizDraft.settings
          .showCorrectAnswers,
    },
    questions: quizDraft.questions.map(
      (question, questionIndex) =>
        normalizeQuizQuestion(
          question,
          questionIndex
        )
    ),
  };
}

function normalizeQuizQuestion(
  question: QuizQuestionDraft,
  questionIndex: number
): QuizQuestionDraft {
  return {
    ...question,
    questionText:
      question.questionText.trim(),
    explanation:
      question.explanation.trim(),
    sortOrder: questionIndex + 1,
    options: question.options.map(
      (option, optionIndex) =>
        normalizeQuizOption(
          option,
          optionIndex
        )
    ),
  };
}

function normalizeQuizOption(
  option: QuizOptionDraft,
  optionIndex: number
): QuizOptionDraft {
  return {
    ...option,
    optionText:
      option.optionText.trim(),
    sortOrder: optionIndex + 1,
  };
}

function validatePdf(
  file: File
): string | null {
  const hasPdfExtension =
    file.name
      .toLowerCase()
      .endsWith(".pdf");

  const hasPdfMimeType =
    file.type === "application/pdf";

  if (
    !hasPdfExtension ||
    !hasPdfMimeType
  ) {
    return "Solo se permiten archivos en formato PDF.";
  }

  if (file.size > MAX_PDF_SIZE) {
    return "El archivo PDF no debe superar los 20 MB.";
  }

  return null;
}

function normalizeOptionalText(
  value: string
): string | null {
  const normalizedValue =
    value.trim();

  return normalizedValue
    ? normalizedValue
    : null;
}

function formatFileSize(
  size: number
): string {
  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes =
    size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(
      1
    )} KB`;
  }

  const megabytes =
    kilobytes / 1024;

  return `${megabytes.toFixed(
    1
  )} MB`;
}

function getSubmitLabel(
  isEditing: boolean,
  lessonType: LessonType
): string {
  if (isEditing) {
    return "Guardar cambios";
  }

  if (lessonType === "RESOURCE") {
    return "Crear lección y subir PDF";
  }

  if (lessonType === "QUIZ") {
    return "Crear cuestionario";
  }

  return "Crear lección";
}

function LessonTypeIcon({
  type,
}: {
  type: LessonType;
}) {
  if (type === "VIDEO") {
    return (
      <MonitorPlay className="size-4" />
    );
  }

  if (type === "RESOURCE") {
    return (
      <FileText className="size-4" />
    );
  }

  if (type === "QUIZ") {
    return (
      <CircleHelp className="size-4" />
    );
  }

  return <Type className="size-4" />;
}