"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  PlayCircle,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import {
  createCulqiCharge,
  createStudentCoursePayment,
  enrollFreeStudentCourse,
  getStudentCatalogCategories,
  getStudentCatalogCourses,
} from "@/features/student-catalog/services/student-catalog.service";
import type {
  StudentCatalogCategory,
  StudentCatalogCourse,
  StudentCatalogCourseType,
  StudentCatalogFilters,
  StudentCatalogPayment,
} from "@/features/student-catalog/types/student-catalog.types";

const CULQI_CHECKOUT_SCRIPT =
  "https://checkout.culqi.com/js/v4";

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (options: {
        title: string;
        currency: string;
        amount: number;
      }) => void;
      options: (options: {
        lang: string;
        installments: boolean;
        modal: boolean;
      }) => void;
      open: () => void;
      token?: {
        id?: string;
      };
      error?: {
        user_message?: string;
        merchant_message?: string;
      };
    };
    culqi?: () => void;
  }
}

type SelectableCourseType =
  | StudentCatalogCourseType
  | "ALL";

type SelectableLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ALL";

export function StudentCatalogClient() {
  const { isChecking } = useAuthGuard(["STUDENT"]);

  const [courses, setCourses] = useState<
    StudentCatalogCourse[]
  >([]);
  const [categories, setCategories] = useState<
    StudentCatalogCategory[]
  >([]);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<
    number | "ALL"
  >("ALL");
  const [courseType, setCourseType] =
    useState<SelectableCourseType>("ALL");
  const [level, setLevel] =
    useState<SelectableLevel>("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] =
    useState<number | null>(null);
  const [creatingPaymentCourseId, setCreatingPaymentCourseId] =
    useState<number | null>(null);
  const [pendingPayment, setPendingPayment] =
    useState<StudentCatalogPayment | null>(null);
  const [processingPaymentId, setProcessingPaymentId] =
    useState<number | null>(null);

  const filters = useMemo<StudentCatalogFilters>(() => {
    const normalizedQuery = query.trim();
    const normalizedMinPrice =
      parseOptionalPrice(minPrice);
    const normalizedMaxPrice =
      parseOptionalPrice(maxPrice);

    return {
      ...(normalizedQuery.length > 0
        ? { query: normalizedQuery }
        : {}),
      ...(categoryId !== "ALL"
        ? { categoryId }
        : {}),
      ...(courseType !== "ALL"
        ? { courseType }
        : {}),
      ...(level !== "ALL"
        ? { level }
        : {}),
      ...(normalizedMinPrice !== undefined
        ? { minPrice: normalizedMinPrice }
        : {}),
      ...(normalizedMaxPrice !== undefined
        ? { maxPrice: normalizedMaxPrice }
        : {}),
    };
  }, [
    categoryId,
    courseType,
    level,
    maxPrice,
    minPrice,
    query,
  ]);

  const loadCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data =
        await getStudentCatalogCourses(filters);

      setCourses(data);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "No se pudo cargar el catálogo."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadCategories = useCallback(async () => {
    try {
      const data =
        await getStudentCatalogCategories();

      setCategories(data);
    } catch (error) {
      toast.error("No se pudieron cargar las categorías.", {
        description: getApiErrorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isChecking, loadCategories]);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCatalog();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isChecking, loadCatalog]);

  async function handleEnroll(
    course: StudentCatalogCourse
  ): Promise<void> {
    try {
      setEnrollingCourseId(course.id);

      await enrollFreeStudentCourse(course.id);

      setCourses((currentCourses) =>
        currentCourses.map((currentCourse) =>
          currentCourse.id === course.id
            ? {
                ...currentCourse,
                enrolled: true,
              }
            : currentCourse
        )
      );

      toast.success("Matrícula registrada.", {
        description: course.title,
      });
    } catch (error) {
      toast.error("No se pudo completar la matrícula.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setEnrollingCourseId(null);
    }
  }

  async function handleCreatePayment(
    course: StudentCatalogCourse
  ): Promise<void> {
    try {
      setCreatingPaymentCourseId(course.id);

      const payment =
        await createStudentCoursePayment(course.id);

      setPendingPayment(payment);

      toast.success("Pago pendiente creado.", {
        description: course.title,
      });
    } catch (error) {
      toast.error("No se pudo iniciar el checkout.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setCreatingPaymentCourseId(null);
    }
  }

  async function handlePayWithCulqi(
    payment: StudentCatalogPayment
  ): Promise<void> {
    try {
      setProcessingPaymentId(payment.id);

      const sourceId =
        await requestCulqiToken(payment);
      const updatedPayment =
        await createCulqiCharge(
          payment.id,
          sourceId
        );

      setPendingPayment(updatedPayment);

      if (updatedPayment.status === "PAID") {
        setCourses((currentCourses) =>
          currentCourses.map((currentCourse) =>
            currentCourse.id ===
            updatedPayment.courseId
              ? {
                  ...currentCourse,
                  enrolled: true,
                }
              : currentCourse
          )
        );

        toast.success("Pago confirmado.", {
          description:
            updatedPayment.courseTitle,
        });
      } else {
        toast.error("Pago no confirmado.", {
          description:
            "Culqi no aprobó el cargo.",
        });
      }
    } catch (error) {
      toast.error("No se pudo procesar el pago.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setProcessingPaymentId(null);
    }
  }

  if (isChecking) {
    return (
      <main className="p-8">
        Validando sesión...
      </main>
    );
  }

  return (
    <DashboardShell
      title="Catálogo"
      description="Explora cursos publicados y elige tu siguiente ruta de aprendizaje."
    >
      <div className="space-y-6">
        <CatalogMetrics courses={courses} />

        <CatalogFilters
          query={query}
          categoryId={categoryId}
          courseType={courseType}
          level={level}
          minPrice={minPrice}
          maxPrice={maxPrice}
          categories={categories}
          onQueryChange={setQuery}
          onCategoryChange={setCategoryId}
          onCourseTypeChange={setCourseType}
          onLevelChange={setLevel}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando catálogo...
          </div>
        )}

        {!isLoading &&
          !error &&
          courses.length === 0 && (
            <Card>
              <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />

                <h2 className="mt-4 text-lg font-semibold">
                  No se encontraron cursos
                </h2>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ajusta la búsqueda o los filtros para ver
                  más opciones publicadas.
                </p>
              </CardContent>
            </Card>
          )}

        {!isLoading &&
          !error &&
          courses.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CatalogCourseCard
                  key={course.id}
                  course={course}
                  isEnrolling={
                      enrollingCourseId === course.id
                  }
                  isCreatingPayment={
                    creatingPaymentCourseId ===
                    course.id
                  }
                  onEnroll={handleEnroll}
                  onCreatePayment={handleCreatePayment}
                />
              ))}
            </div>
          )}

        <PendingPaymentDialog
          payment={pendingPayment}
          isProcessing={
            pendingPayment !== null &&
            processingPaymentId === pendingPayment.id
          }
          onPay={handlePayWithCulqi}
          onOpenChange={(open) => {
            if (!open) {
              setPendingPayment(null);
            }
          }}
        />
      </div>
    </DashboardShell>
  );
}

function CatalogFilters({
  query,
  categoryId,
  courseType,
  level,
  minPrice,
  maxPrice,
  categories,
  onQueryChange,
  onCategoryChange,
  onCourseTypeChange,
  onLevelChange,
  onMinPriceChange,
  onMaxPriceChange,
}: {
  query: string;
  categoryId: number | "ALL";
  courseType: SelectableCourseType;
  level: SelectableLevel;
  minPrice: string;
  maxPrice: string;
  categories: StudentCatalogCategory[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: number | "ALL") => void;
  onCourseTypeChange: (
    value: SelectableCourseType
  ) => void;
  onLevelChange: (value: SelectableLevel) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(220px,1fr)_180px_150px_160px_120px_120px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) =>
              onQueryChange(event.target.value)
            }
            placeholder="Buscar cursos..."
            className="pl-9"
          />
        </div>

        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={categoryId}
          onChange={(event) => {
            const value = event.target.value;

            onCategoryChange(
              value === "ALL" ? "ALL" : Number(value)
            );
          }}
        >
          <option value="ALL">Todas las categorías</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={courseType}
          onChange={(event) =>
            onCourseTypeChange(
              event.target.value as SelectableCourseType
            )
          }
        >
          <option value="ALL">Todos los tipos</option>
          <option value="FREE">Gratuitos</option>
          <option value="PAID">De pago</option>
        </select>

        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={level}
          onChange={(event) =>
            onLevelChange(
              event.target.value as SelectableLevel
            )
          }
        >
          <option value="ALL">Todos los niveles</option>
          <option value="BEGINNER">Principiante</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
        </select>

        <Input
          value={minPrice}
          inputMode="decimal"
          onChange={(event) =>
            onMinPriceChange(event.target.value)
          }
          placeholder="Precio mín."
        />

        <Input
          value={maxPrice}
          inputMode="decimal"
          onChange={(event) =>
            onMaxPriceChange(event.target.value)
          }
          placeholder="Precio máx."
        />
      </CardContent>
    </Card>
  );
}

function CatalogMetrics({
  courses,
}: {
  courses: StudentCatalogCourse[];
}) {
  const freeCourses = courses.filter(
    (course) => course.courseType === "FREE"
  ).length;
  const enrolledCourses = courses.filter(
    (course) => course.enrolled
  ).length;

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        title="Resultados"
        value={courses.length}
        icon={BookOpen}
      />

      <MetricCard
        title="Gratuitos"
        value={freeCourses}
        icon={Sparkles}
      />

      <MetricCard
        title="Matriculados"
        value={enrolledCourses}
        icon={CheckCircle2}
      />
    </section>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
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

function CatalogCourseCard({
  course,
  isEnrolling,
  isCreatingPayment,
  onEnroll,
  onCreatePayment,
}: {
  course: StudentCatalogCourse;
  isEnrolling: boolean;
  isCreatingPayment: boolean;
  onEnroll: (
    course: StudentCatalogCourse
  ) => Promise<void>;
  onCreatePayment: (
    course: StudentCatalogCourse
  ) => Promise<void>;
}) {
  const isFree = course.courseType === "FREE";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {course.categoryName}
          </Badge>

          <Badge
            variant={isFree ? "default" : "outline"}
          >
            {isFree
              ? "Gratis"
              : formatPrice(course.price)}
          </Badge>

          {course.enrolled && (
            <Badge>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Matriculado
            </Badge>
          )}
        </div>

        <CardTitle className="line-clamp-2 text-lg">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {course.shortDescription && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {course.shortDescription}
          </p>
        )}

        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            {translateLevel(course.level)}
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {course.instructorName ||
              "Instructor NovaLearn"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <CourseAction
          course={course}
          isEnrolling={isEnrolling}
          isCreatingPayment={isCreatingPayment}
          onEnroll={onEnroll}
          onCreatePayment={onCreatePayment}
        />
      </CardFooter>
    </Card>
  );
}

function CourseAction({
  course,
  isEnrolling,
  isCreatingPayment,
  onEnroll,
  onCreatePayment,
}: {
  course: StudentCatalogCourse;
  isEnrolling: boolean;
  isCreatingPayment: boolean;
  onEnroll: (
    course: StudentCatalogCourse
  ) => Promise<void>;
  onCreatePayment: (
    course: StudentCatalogCourse
  ) => Promise<void>;
}) {
  if (course.enrolled) {
    return (
      <Button
        asChild
        className="w-full"
      >
        <Link href={`/student/courses/${course.id}/learn`}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Ver curso
        </Link>
      </Button>
    );
  }

  if (course.courseType === "FREE") {
    return (
      <Button
        type="button"
        className="w-full"
        disabled={isEnrolling}
        onClick={() => void onEnroll(course)}
      >
        {isEnrolling ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Inscribirme gratis
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isCreatingPayment}
      onClick={() => void onCreatePayment(course)}
    >
      {isCreatingPayment ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      Comprar curso
    </Button>
  );
}

function PendingPaymentDialog({
  payment,
  isProcessing,
  onPay,
  onOpenChange,
}: {
  payment: StudentCatalogPayment | null;
  isProcessing: boolean;
  onPay: (
    payment: StudentCatalogPayment
  ) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={payment !== null}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {payment?.status === "PAID"
              ? "Pago confirmado"
              : "Pago pendiente"}
          </DialogTitle>

          <DialogDescription>
            {payment?.status === "PAID"
              ? "Tu matrícula ya fue activada."
              : "Completa el pago con Culqi. La matrícula se activará solo después de la confirmación del proveedor."}
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                {payment.courseTitle}
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatPrice(payment.amount)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {payment.status}
                </Badge>
                <Badge variant="outline">
                  {payment.provider}
                </Badge>
              </div>
            </div>

            <Alert>
              <AlertTitle>
                {payment.status === "PAID"
                  ? "Matrícula activada"
                  : "Confirmación segura"}
              </AlertTitle>
              <AlertDescription>
                {payment.status === "PAID"
                  ? "Ya puedes ingresar al curso desde tus cursos matriculados."
                  : "NovaLearn verificará el cargo en backend antes de marcar el pago como aprobado."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {payment?.status === "PAID" && (
            <Button asChild>
              <Link
                href={`/student/courses/${payment.courseId}/learn`}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Ver curso
              </Link>
            </Button>
          )}

          {payment?.status === "PENDING" && (
            <Button
              type="button"
              disabled={isProcessing}
              onClick={() => void onPay(payment)}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Pagar con Culqi
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function requestCulqiToken(
  payment: StudentCatalogPayment
): Promise<string> {
  const publicKey =
    process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "La clave pública de Culqi no está configurada."
    );
  }

  await loadCulqiCheckout();

  return new Promise((resolve, reject) => {
    if (!window.Culqi) {
      reject(
        new Error(
          "No se pudo cargar el checkout de Culqi."
        )
      );
      return;
    }

    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({
      title: payment.courseTitle,
      currency: payment.currency,
      amount: Math.round(payment.amount * 100),
    });
    window.Culqi.options({
      lang: "es",
      installments: false,
      modal: true,
    });

    window.culqi = () => {
      const tokenId = window.Culqi?.token?.id;

      if (tokenId) {
        resolve(tokenId);
        return;
      }

      const message =
        window.Culqi?.error?.user_message ??
        window.Culqi?.error?.merchant_message ??
        "Culqi no devolvió un token válido.";

      reject(new Error(message));
    };

    window.Culqi.open();
  });
}

function loadCulqiCheckout(): Promise<void> {
  if (window.Culqi) {
    return Promise.resolve();
  }

  const existingScript =
    document.querySelector<HTMLScriptElement>(
      `script[src="${CULQI_CHECKOUT_SCRIPT}"]`
    );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "No se pudo cargar Culqi Checkout."
            )
          ),
        { once: true }
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script =
      document.createElement("script");
    script.src = CULQI_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          "No se pudo cargar Culqi Checkout."
        )
      );

    document.body.appendChild(script);
  });
}

function parseOptionalPrice(
  value: string
): number | undefined {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : undefined;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(price);
}

function translateLevel(
  level: string | null
): string {
  if (!level) {
    return "Nivel no especificado";
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
