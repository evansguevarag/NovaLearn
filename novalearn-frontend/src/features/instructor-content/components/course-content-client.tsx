"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FileQuestion,
  FileText,
  GripVertical,
  MonitorPlay,
  Pencil,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { DeleteLessonDialog } from "@/features/instructor-content/components/delete-lesson-dialog";
import { DeleteModuleDialog } from "@/features/instructor-content/components/delete-module-dialog";
import { LessonFormDialog } from "@/features/instructor-content/components/lesson-form-dialog";
import {
  getManagedQuizDraft,
  saveManagedQuizDraft,
} from "@/features/instructor-content/services/quiz-management.service";
import { LessonPdfThumbnail } from "@/features/instructor-content/components/lesson-pdf-thumbnail";
import { ManagedCourseTabs } from "@/features/instructor-content/components/managed-course-tabs";
import { ModuleFormDialog } from "@/features/instructor-content/components/module-form-dialog";

import {
  createManagedCourseModule,
  createManagedLesson,
  deleteManagedCourseModule,
  deleteManagedLesson,
  getManagedCourseById,
  getManagedCourseModules,
  getManagedLessonsByModule,
  updateManagedCourseModule,
  updateManagedLesson,
  uploadManagedLessonResource,
  type CourseContentContext,
  type CourseContentSummary,
} from "@/features/instructor-content/services/course-content.service";

import type {
  InstructorCourseModule,
  InstructorCourseModuleRequest,
  InstructorLesson,
  InstructorLessonRequest,
  InstructorModuleWithLessons,
  LessonType,
  QuizDraft,
} from "@/features/instructor-content/types/instructor-content.types";

interface CourseContentClientProps {
  courseId: number;
  context: CourseContentContext;
}

export function CourseContentClient({
  courseId,
  context,
}: CourseContentClientProps) {
  const searchParams = useSearchParams();

  const requestedEvaluationId = Number(
    searchParams.get("evaluationId")
  );

  const allowedRoles =
    context === "ADMIN"
      ? (["ADMIN"] as const)
      : (["INSTRUCTOR"] as const);

  const { isChecking } =
    useAuthGuard([...allowedRoles]);

  const [course, setCourse] =
    useState<CourseContentSummary | null>(
      null
    );

  const [modules, setModules] =
    useState<
      InstructorModuleWithLessons[]
    >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isSubmittingModule,
    setIsSubmittingModule,
  ] = useState(false);

  const [
    isDeletingModule,
    setIsDeletingModule,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    isModuleFormOpen,
    setIsModuleFormOpen,
  ] = useState(false);

  const [
    selectedModule,
    setSelectedModule,
  ] =
    useState<InstructorCourseModule | null>(
      null
    );

  const [
    moduleToDelete,
    setModuleToDelete,
  ] =
    useState<InstructorCourseModule | null>(
      null
    );

  const [
    isLessonFormOpen,
    setIsLessonFormOpen,
  ] = useState(false);

  const [
    selectedLesson,
    setSelectedLesson,
  ] =
    useState<InstructorLesson | null>(
      null
    );

  const [
    selectedQuizDraft,
    setSelectedQuizDraft,
  ] =
    useState<QuizDraft | null>(
      null
    );

  const [
    selectedLessonModuleId,
    setSelectedLessonModuleId,
  ] = useState<number | null>(null);

  const [
    lessonToDelete,
    setLessonToDelete,
  ] =
    useState<InstructorLesson | null>(
      null
    );

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    Promise.all([
      getManagedCourseById(
        context,
        courseId
      ),
      getManagedCourseModules(
        context,
        courseId
      ),
    ])
      .then(async ([courseData, modulesData]) => {
        const sortedModules =
          sortCourseModules(modulesData);

        const modulesWithLessons =
          await Promise.all(
            sortedModules.map(
              async (
                courseModule
              ): Promise<InstructorModuleWithLessons> => {
                try {
                  const lessons =
                    await getManagedLessonsByModule(
                      context,
                      courseModule.id
                    );

                  return {
                    ...courseModule,
                    lessons:
                      sortLessons(lessons),
                    isLoadingLessons: false,
                    lessonsError: null,
                  };
                } catch (
                  lessonError: unknown
                ) {
                  return {
                    ...courseModule,
                    lessons: [],
                    isLoadingLessons: false,
                    lessonsError:
                      getApiErrorMessage(
                        lessonError,
                        "No se pudieron cargar las lecciones."
                      ),
                  };
                }
              }
            )
          );

        if (!isCancelled) {
          setCourse(courseData);
          setModules(
            modulesWithLessons
          );

          if (
            Number.isInteger(
              requestedEvaluationId
            ) &&
            requestedEvaluationId > 0
          ) {
            const requestedEvaluation =
              modulesWithLessons
                .flatMap(
                  (courseModule) =>
                    courseModule.lessons
                )
                .find(
                  (lesson) =>
                    lesson.id ===
                      requestedEvaluationId &&
                    lesson.lessonType ===
                      "QUIZ"
                );

            if (requestedEvaluation) {
              try {
                const quizDraft =
                  await getManagedQuizDraft(
                    context,
                    requestedEvaluation.id
                  );

                if (!isCancelled) {
                  setSelectedLesson(
                    requestedEvaluation
                  );
                  setSelectedQuizDraft(
                    quizDraft
                  );
                  setSelectedLessonModuleId(
                    requestedEvaluation.moduleId
                  );
                  setIsLessonFormOpen(true);
                }
              } catch (
                evaluationError: unknown
              ) {
                if (!isCancelled) {
                  const message =
                    getApiErrorMessage(
                      evaluationError,
                      "No se pudo abrir la evaluación solicitada."
                    );

                  setError(message);
                  toast.error(message);
                }
              }
            }
          }
        }
      })
      .catch((loadError: unknown) => {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(
              loadError,
              "No se pudo cargar el contenido del curso."
            )
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    context,
    courseId,
    isChecking,
    requestedEvaluationId,
  ]);


  const suggestedModuleSortOrder =
    modules.length === 0
      ? 1
      : Math.max(
          ...modules.map(
            (courseModule) =>
              courseModule.sortOrder
          )
        ) + 1;

  const totalLessons =
    modules.reduce(
      (total, courseModule) =>
        total +
        courseModule.lessons.length,
      0
    );

  const previewLessons =
    modules.reduce(
      (total, courseModule) =>
        total +
        courseModule.lessons.filter(
          (lesson) => lesson.preview
        ).length,
      0
    );

  function openCreateModule(): void {
    setSelectedModule(null);
    setIsModuleFormOpen(true);
  }

  function openEditModule(
    courseModule: InstructorCourseModule
  ): void {
    setSelectedModule(courseModule);
    setIsModuleFormOpen(true);
  }

  function openCreateLesson(
    moduleId: number
  ): void {
    setSelectedLesson(null);
    setSelectedQuizDraft(null);
    setSelectedLessonModuleId(moduleId);
    setIsLessonFormOpen(true);
  }

  async function openEditLesson(
    lesson: InstructorLesson
  ): Promise<void> {
      try {
        setError(null);

        let quizDraft: QuizDraft | null =
          null;

        if (
          lesson.lessonType === "QUIZ"
        ) {
          quizDraft =
            await getManagedQuizDraft(
              context,
              lesson.id
            );
        }

        setSelectedLesson(lesson);
        setSelectedQuizDraft(quizDraft);
        setSelectedLessonModuleId(
          lesson.moduleId
        );
        setIsLessonFormOpen(true);
      } catch (loadError: unknown) {
        const message =
          getApiErrorMessage(
            loadError,
            lesson.lessonType === "QUIZ"
              ? "No se pudo cargar la configuración y las preguntas del cuestionario."
              : "No se pudo abrir la lección."
          );

        setError(message);
        toast.error(message);
      }
  }

  async function handleSaveModule(
    request: InstructorCourseModuleRequest
  ): Promise<void> {
    try {
      setIsSubmittingModule(true);
      setError(null);

      if (selectedModule) {
        const updatedModule =
          await updateManagedCourseModule(
            context,
            selectedModule.id,
            request
          );

        setModules((current) =>
          sortModuleViewModels(
            current.map((courseModule) =>
              courseModule.id ===
              updatedModule.id
                ? {
                    ...courseModule,
                    ...updatedModule,
                  }
                : courseModule
            )
          )
        );

        toast.success(
          "Módulo actualizado correctamente."
        );
      } else {
        const createdModule =
          await createManagedCourseModule(
            context,
            request
          );

        setModules((current) =>
          sortModuleViewModels([
            ...current,
            {
              ...createdModule,
              lessons: [],
              isLoadingLessons: false,
              lessonsError: null,
            },
          ])
        );

        toast.success(
          "Módulo creado correctamente."
        );
      }

      setIsModuleFormOpen(false);
      setSelectedModule(null);
    } catch (saveError: unknown) {
      const message =
        getApiErrorMessage(
          saveError,
          selectedModule
            ? "No se pudo actualizar el módulo."
            : "No se pudo crear el módulo."
        );

      setError(message);
      toast.error(message);

      throw saveError;
    } finally {
      setIsSubmittingModule(false);
    }
  }

  async function handleDeleteModule():
    Promise<void> {
    if (!moduleToDelete) {
      return;
    }

    try {
      setIsDeletingModule(true);
      setError(null);

      await deleteManagedCourseModule(
        context,
        moduleToDelete.id
      );

      setModules((current) =>
        current.filter(
          (courseModule) =>
            courseModule.id !==
            moduleToDelete.id
        )
      );

      setModuleToDelete(null);

      toast.success(
        "Módulo eliminado correctamente."
      );
    } catch (deleteError: unknown) {
      const message =
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar el módulo."
        );

      setError(message);
      toast.error(message);
    } finally {
      setIsDeletingModule(false);
    }
  }

  async function handleSaveLesson(
    request: InstructorLessonRequest,
    resourceFile: File | null,
    quiz: QuizDraft | null
  ): Promise<void> {
    try {
      setError(null);

      if (selectedLesson) {
        const updatedLesson =
          await updateManagedLesson(
            context,
            selectedLesson.id,
            request
          );

        if (quiz) {
          await saveManagedQuizDraft(
            context,
            updatedLesson.id,
            quiz
          );
        }

        setModules((current) =>
          current.map((courseModule) =>
            courseModule.id ===
            updatedLesson.moduleId
              ? {
                  ...courseModule,
                  lessons: sortLessons(
                    courseModule.lessons.map(
                      (lesson) =>
                        lesson.id ===
                        updatedLesson.id
                          ? updatedLesson
                          : lesson
                    )
                  ),
                }
              : courseModule
          )
        );

        toast.success(
          quiz
            ? "Cuestionario actualizado correctamente."
            : "Lección actualizada correctamente."
        );

        closeLessonForm();
        return;
      }

      let createdLesson:
        | InstructorLesson
        | null = null;

      try {
        createdLesson =
          await createManagedLesson(
            context,
            request
          );

        let finalLesson =
          createdLesson;

        if (resourceFile) {
          finalLesson =
            await uploadManagedLessonResource(
              context,
              createdLesson.id,
              resourceFile
            );
        }

        if (quiz) {
          await saveManagedQuizDraft(
            context,
            createdLesson.id,
            quiz
          );
        }

        setModules((current) =>
          current.map((courseModule) =>
            courseModule.id ===
            finalLesson.moduleId
              ? {
                  ...courseModule,
                  lessons: sortLessons([
                    ...courseModule.lessons,
                    finalLesson,
                  ]),
                }
              : courseModule
          )
        );

        if (quiz) {
          toast.success(
            "Cuestionario creado correctamente."
          );
        } else if (resourceFile) {
          toast.success(
            "Lección y recurso PDF creados correctamente."
          );
        } else {
          toast.success(
            "Lección creada correctamente."
          );
        }
      } catch (creationError: unknown) {
        if (createdLesson) {
          try {
            await deleteManagedLesson(
              context,
              createdLesson.id
            );
          } catch {
            // El error principal es el que debe mostrarse.
          }
        }

        throw creationError;
      }

      closeLessonForm();
    } catch (saveError: unknown) {
      const message =
        getApiErrorMessage(
          saveError,
          selectedLesson
            ? "No se pudo actualizar la lección."
            : request.lessonType === "QUIZ"
              ? "No se pudo crear el cuestionario."
              : "No se pudo crear la lección."
        );

      setError(message);
      toast.error(message);

      throw saveError;
    }
  }
  async function handleDeleteLesson(
    lesson: InstructorLesson
  ): Promise<void> {
    try {
      setError(null);

      await deleteManagedLesson(
        context,
        lesson.id
      );

      setModules((current) =>
        current.map((courseModule) =>
          courseModule.id ===
          lesson.moduleId
            ? {
                ...courseModule,
                lessons:
                  courseModule.lessons.filter(
                    (currentLesson) =>
                      currentLesson.id !==
                      lesson.id
                  ),
              }
            : courseModule
        )
      );

      setLessonToDelete(null);

      toast.success(
        "Lección eliminada correctamente."
      );
    } catch (deleteError: unknown) {
      const message =
        getApiErrorMessage(
          deleteError,
          "No se pudo eliminar la lección."
        );

      setError(message);
      toast.error(message);

      throw deleteError;
    }
  }


  function replaceLessonInState(
    updatedLesson: InstructorLesson
  ): void {
    setSelectedLesson(updatedLesson);

    setModules((current) =>
      current.map((courseModule) =>
        courseModule.id ===
        updatedLesson.moduleId
          ? {
              ...courseModule,
              lessons: sortLessons(
                courseModule.lessons.map(
                  (lesson) =>
                    lesson.id ===
                    updatedLesson.id
                      ? updatedLesson
                      : lesson
                )
              ),
            }
          : courseModule
      )
    );
  }

  function closeLessonForm(): void {
    setIsLessonFormOpen(false);
    setSelectedLesson(null);
    setSelectedQuizDraft(null);
    setSelectedLessonModuleId(null);
  }

  function getSuggestedLessonSortOrder(
    moduleId: number
  ): number {
    const courseModule =
      modules.find(
        (item) =>
          item.id === moduleId
      );

    if (
      !courseModule ||
      courseModule.lessons.length === 0
    ) {
      return 1;
    }

    return (
      Math.max(
        ...courseModule.lessons.map(
          (lesson) =>
            lesson.sortOrder
        )
      ) + 1
    );
  }

  if (isChecking || isLoading) {
    return (
      <DashboardShell
        title="Contenido del curso"
        description="Cargando estructura académica."
      >
        <ContentSkeleton />
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        title="Curso no disponible"
        description="No se pudo abrir el contenido solicitado."
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>

          <AlertDescription>
            {error ??
              "El curso no existe o no tienes permiso para administrarlo."}
          </AlertDescription>
        </Alert>
      </DashboardShell>
    );
  }

  const backHref =
    context === "ADMIN"
      ? `/admin/courses/${course.id}`
      : `/instructor/courses/${course.id}`;

  const backLabel =
    context === "ADMIN"
      ? "Volver a la administración"
      : "Volver al curso";

  return (
    <DashboardShell
      title="Contenido del curso"
      description={course.title}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>

          <Button
            type="button"
            onClick={openCreateModule}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo módulo
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <ManagedCourseTabs
          courseId={course.id}
          context={context}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>

            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Módulos"
            value={modules.length}
            icon={BookOpen}
          />

          <MetricCard
            title="Lecciones"
            value={totalLessons}
            icon={FileText}
          />

          <MetricCard
            title="Vistas previas"
            value={previewLessons}
            icon={Eye}
          />
        </section>

        {modules.length === 0 ? (
          <EmptyModules
            onCreate={openCreateModule}
          />
        ) : (
          <div className="space-y-5">
            {modules.map(
              (courseModule) => (
                <ModuleCard
                  key={courseModule.id}
                  module={courseModule}
                  onEditModule={() =>
                    openEditModule(
                      courseModule
                    )
                  }
                  onDeleteModule={() =>
                    setModuleToDelete(
                      courseModule
                    )
                  }
                  onCreateLesson={() =>
                    openCreateLesson(
                      courseModule.id
                    )
                  }
                  onEditLesson={
                    openEditLesson
                  }
                  onDeleteLesson={
                    setLessonToDelete
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      <ModuleFormDialog
        key={
          selectedModule
            ? `edit-${selectedModule.id}`
            : `new-${suggestedModuleSortOrder}`
        }
        open={isModuleFormOpen}
        courseId={course.id}
        module={selectedModule}
        suggestedSortOrder={
          suggestedModuleSortOrder
        }
        isSubmitting={
          isSubmittingModule
        }
        onOpenChange={(open) => {
          setIsModuleFormOpen(open);

          if (!open) {
            setSelectedModule(null);
          }
        }}
        onSubmit={handleSaveModule}
      />

      <DeleteModuleDialog
        module={moduleToDelete}
        isDeleting={isDeletingModule}
        onOpenChange={(open) => {
          if (!open) {
            setModuleToDelete(null);
          }
        }}
        onConfirm={handleDeleteModule}
      />

      {selectedLessonModuleId !== null && (
        <LessonFormDialog
          key={
            selectedLesson
              ? `edit-lesson-${selectedLesson.id}`
              : `new-lesson-${selectedLessonModuleId}-${getSuggestedLessonSortOrder(
                  selectedLessonModuleId
                )}`
          }
          open={isLessonFormOpen}
          context={context}
          moduleId={
            selectedLessonModuleId
          }
          lesson={selectedLesson}
          initialQuizDraft={
            selectedQuizDraft
          }
          suggestedSortOrder={getSuggestedLessonSortOrder(
            selectedLessonModuleId
          )}
          onOpenChange={(open) => {
            if (!open) {
              closeLessonForm();
              return;
            }

            setIsLessonFormOpen(true);
          }}
          onSubmit={handleSaveLesson}
          onLessonChange={
            replaceLessonInState
          }
        />
      )}

      <DeleteLessonDialog
        open={lessonToDelete !== null}
        lesson={lessonToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setLessonToDelete(null);
          }
        }}
        onConfirm={handleDeleteLesson}
      />
    </DashboardShell>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

interface ModuleCardProps {
  module: InstructorModuleWithLessons;
  onEditModule: () => void;
  onDeleteModule: () => void;
  onCreateLesson: () => void;
  onEditLesson: (
    lesson: InstructorLesson
  ) => void;
  onDeleteLesson: (
    lesson: InstructorLesson
  ) => void;
}

function ModuleCard({
  module,
  onEditModule,
  onDeleteModule,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] =
    useState(false);

  function handleCreateLesson(): void {
    setIsExpanded(true);
    onCreateLesson();
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          className={[
            "flex flex-col gap-4 p-5 sm:flex-row sm:items-start",
            isExpanded ? "border-b" : "",
          ].join(" ")}
        >
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="mt-1 rounded-lg border bg-muted/30 p-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  Módulo {module.sortOrder}
                </Badge>

                <Badge
                  variant={
                    module.active
                      ? "default"
                      : "secondary"
                  }
                >
                  {module.active
                    ? "Activo"
                    : "Inactivo"}
                </Badge>

                <Badge variant="secondary">
                  {module.lessons.length}{" "}
                  {module.lessons.length === 1
                    ? "lección"
                    : "lecciones"}
                </Badge>
              </div>

              <h2 className="mt-3 text-lg font-semibold">
                {module.title}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {module.description?.trim() ||
                  "Este módulo todavía no tiene descripción."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreateLesson}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva lección
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-40 justify-center"
              aria-expanded={isExpanded}
              onClick={() =>
                setIsExpanded(
                  (current) => !current
                )
              }
            >
              {isExpanded ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}

              {isExpanded
                ? "Ocultar lecciones"
                : "Ver lecciones"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEditModule}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onDeleteModule}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-5">
            {module.lessonsError && (
            <Alert
              variant="destructive"
              className="mb-4"
            >
              <AlertTitle>
                Error al cargar lecciones
              </AlertTitle>

              <AlertDescription>
                {module.lessonsError}
              </AlertDescription>
            </Alert>
          )}

          {module.lessons.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <FileText className="mx-auto h-7 w-7 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Este módulo todavía no tiene
                lecciones
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Agrega una lección de video,
                texto o recurso.
              </p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={handleCreateLesson}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear primera lección
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {module.lessons.map(
                (lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={() =>
                      onEditLesson(
                        lesson
                      )
                    }
                    onDelete={() =>
                      onDeleteLesson(
                        lesson
                      )
                    }
                  />
                )
              )}
            </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LessonItemProps {
  lesson: InstructorLesson;
  onEdit: () => void;
  onDelete: () => void;
}

function LessonItem({
  lesson,
  onEdit,
  onDelete,
}: LessonItemProps) {
  const hasPdfResource =
    lesson.lessonType === "RESOURCE" &&
    Boolean(lesson.resourceUrl);

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="rounded-md bg-muted p-2">
            <LessonIcon
              type={lesson.lessonType}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Lección {lesson.sortOrder}
              </Badge>

              <Badge variant="secondary">
                {getLessonTypeLabel(
                  lesson.lessonType
                )}
              </Badge>

              <Badge
                variant={
                  lesson.active
                    ? "default"
                    : "secondary"
                }
              >
                {lesson.active
                  ? "Activa"
                  : "Inactiva"}
              </Badge>

              {lesson.preview && (
                <Badge variant="outline">
                  <Eye className="mr-1 h-3 w-3" />
                  Vista previa
                </Badge>
              )}
            </div>

            <h3 className="mt-2 font-medium">
              {lesson.title}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {lesson.description?.trim() ||
                getLessonFallbackDescription(
                  lesson
                )}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />

                {lesson.durationMinutes} min
              </span>

              <span className="flex items-center gap-1">
                {lesson.preview ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}

                {lesson.preview
                  ? "Acceso previo"
                  : "Solo matriculados"}
              </span>

              {lesson.resourceUrl && (
                <a
                  href={lesson.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex max-w-full items-center gap-1 font-medium text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate">
                    {lesson.resourceFileName ??
                      "Abrir PDF"}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {hasPdfResource &&
        lesson.resourceUrl && (
          <LessonPdfThumbnail
            pdfUrl={lesson.resourceUrl}
            fileName={
              lesson.resourceFileName
            }
            fileSize={
              lesson.resourceFileSize
            }
          />
        )}
    </div>
  );
}

interface EmptyModulesProps {
  onCreate: () => void;
}

function EmptyModules({
  onCreate,
}: EmptyModulesProps) {
  return (
    <Card>
      <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          El curso aún no tiene módulos
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Crea el primer módulo para comenzar a
          organizar las lecciones y materiales del
          curso.
        </p>

        <Button
          type="button"
          className="mt-5"
          onClick={onCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear primer módulo
        </Button>
      </CardContent>
    </Card>
  );
}

function LessonIcon({
  type,
}: {
  type: LessonType;
}) {
  if (type === "VIDEO") {
    return (
      <MonitorPlay className="h-4 w-4" />
    );
  }

  if (type === "RESOURCE") {
    return (
      <FileText className="h-4 w-4" />
    );
  }

  if (type === "QUIZ") {
    return (
      <FileQuestion className="h-4 w-4" />
    );
  }

  return <Type className="h-4 w-4" />;
}

function getLessonTypeLabel(
  type: LessonType
): string {
  if (type === "VIDEO") {
    return "Video";
  }

  if (type === "RESOURCE") {
    return "Recurso";
  }

  if (type === "QUIZ") {
    return "Cuestionario";
  }

  return "Texto";
}

function getLessonFallbackDescription(
  lesson: InstructorLesson
): string {
  if (lesson.lessonType === "VIDEO") {
    return lesson.videoUrl
      ? "Lección con contenido audiovisual."
      : "Video pendiente de configurar.";
  }

  if (lesson.lessonType === "RESOURCE") {
    return lesson.resourceUrl
      ? "Lección con material PDF disponible."
      : "Recurso PDF pendiente de subir.";
  }

  if (lesson.lessonType === "QUIZ") {
    return "Lección basada en una evaluación o cuestionario.";
  }

  return "Lección con contenido escrito.";
}

function sortCourseModules(
  modules: InstructorCourseModule[]
): InstructorCourseModule[] {
  return [...modules].sort(
    (first, second) =>
      first.sortOrder -
      second.sortOrder
  );
}

function sortModuleViewModels(
  modules: InstructorModuleWithLessons[]
): InstructorModuleWithLessons[] {
  return [...modules].sort(
    (first, second) =>
      first.sortOrder -
      second.sortOrder
  );
}

function sortLessons(
  lessons: InstructorLesson[]
): InstructorLesson[] {
  return [...lessons].sort(
    (first, second) =>
      first.sortOrder -
      second.sortOrder
  );
}

function ContentSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full"
          />
        ))}
      </div>

      {Array.from({
        length: 3,
      }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-56 w-full"
        />
      ))}
    </div>
  );
}