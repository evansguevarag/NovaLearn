"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleDollarSign,
  FilePenLine,
  Pencil,
  Plus,
  Rocket,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { getInstructorCourses } from "@/features/instructor-courses/services/instructor-course.service";

import type {
  CourseStatus,
  CourseType,
  InstructorCourse,
} from "@/features/instructor-courses/types/instructor-course.types";

export function InstructorCoursesClient() {
  const { isChecking } = useAuthGuard(["INSTRUCTOR"]);

  const [courses, setCourses] = useState<
    InstructorCourse[]
  >([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    CourseStatus | "ALL"
  >("ALL");
  const [courseType, setCourseType] = useState<
    CourseType | "ALL"
  >("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

useEffect(() => {
  if (isChecking) {
    return;
  }

  let isCancelled = false;

  getInstructorCourses()
    .then((response) => {
      if (!isCancelled) {
        setCourses(response);
      }
    })
    .catch((error: unknown) => {
      if (!isCancelled) {
        setError(
          getApiErrorMessage(
            error,
            "No se pudieron cargar tus cursos."
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
}, [isChecking]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        course.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.categoryName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        status === "ALL" || course.status === status;

      const matchesType =
        courseType === "ALL" ||
        course.courseType === courseType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [courses, search, status, courseType]);

  const publishedCourses = courses.filter(
    (course) => course.status === "PUBLISHED"
  ).length;

  const draftCourses = courses.filter(
    (course) => course.status === "DRAFT"
  ).length;

  const paidCourses = courses.filter(
    (course) => course.courseType === "PAID"
  ).length;

  if (isChecking) {
    return <main className="p-8">Validando sesión...</main>;
  }

  return (
    <DashboardShell
      title="Mis cursos"
      description="Crea y administra el contenido de tus cursos."
      actions={
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo curso
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Cursos totales"
            value={courses.length}
            icon={BookOpen}
          />

          <MetricCard
            title="Publicados"
            value={publishedCourses}
            icon={Rocket}
          />

          <MetricCard
            title="Borradores"
            value={draftCourses}
            icon={FilePenLine}
          />

          <MetricCard
            title="Cursos de pago"
            value={paidCourses}
            icon={CircleDollarSign}
          />
        </section>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-5">
            <div>
              <CardTitle className="text-lg">
                Catálogo del instructor
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {filteredCourses.length} de {courses.length} cursos
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_170px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar por título o categoría..."
                  className="pl-9"
                />
              </div>

              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | CourseStatus
                      | "ALL"
                  )
                }
              >
                <option value="ALL">
                  Todos los estados
                </option>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">
                  Publicado
                </option>
                <option value="ARCHIVED">
                  Archivado
                </option>
              </select>

              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={courseType}
                onChange={(event) =>
                  setCourseType(
                    event.target.value as
                      | CourseType
                      | "ALL"
                  )
                }
              >
                <option value="ALL">
                  Todos los tipos
                </option>
                <option value="FREE">Gratuito</option>
                <option value="PAID">De pago</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="min-w-0">
            {isLoading ? (
              <CoursesSkeleton />
            ) : (
              <CoursesTable courses={filteredCourses} />
            )}
          </CardContent>
        </Card>
      </div>
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
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

interface CoursesTableProps {
  courses: InstructorCourse[];
}

function CoursesTable({
  courses,
}: CoursesTableProps) {
  if (courses.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>

        <p className="font-medium">
          No se encontraron cursos
        </p>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Crea un nuevo curso o modifica los filtros de
          búsqueda.
        </p>

        <Button asChild className="mt-5">
          <Link href="/instructor/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear curso
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-72">
              Curso
            </TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <CourseThumbnail
                    title={course.title}
                    thumbnailUrl={course.thumbnailUrl}
                  />

                  <div className="min-w-0">
                    <p className="max-w-80 truncate font-medium">
                      {course.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {translateLevel(course.level)}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {course.categoryName}
              </TableCell>

              <TableCell>
                <CourseStatusBadge
                  status={course.status}
                />
              </TableCell>

              <TableCell>
                {course.courseType === "FREE"
                  ? "Gratuito"
                  : formatCurrency(course.price)}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                >
                  <Link
                    href={`/instructor/courses/${course.id}`}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface CourseThumbnailProps {
  title: string;
  thumbnailUrl: string | null;
}

function CourseThumbnail({
  title,
  thumbnailUrl,
}: CourseThumbnailProps) {
  return (
    <div
      className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted bg-cover bg-center"
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
          ? `Miniatura del curso ${title}`
          : undefined
      }
    >
      {!thumbnailUrl && (
        <BookOpen className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

interface CourseStatusBadgeProps {
  status: CourseStatus;
}

function CourseStatusBadge({
  status,
}: CourseStatusBadgeProps) {
  const variants: Record<
    CourseStatus,
    "default" | "secondary" | "outline"
  > = {
    PUBLISHED: "default",
    DRAFT: "secondary",
    ARCHIVED: "outline",
  };

  return (
    <Badge variant={variants[status]}>
      {translateStatus(status)}
    </Badge>
  );
}

function CoursesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-16 w-full"
        />
      ))}
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

function translateLevel(
  level: string | null
): string {
  if (!level) {
    return "Nivel no definido";
  }

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
