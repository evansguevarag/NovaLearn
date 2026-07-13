"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  PlayCircle,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  cancelStudentCoursePayment,
  createCulqiCharge,
  createCulqiOrder,
  createManualStudentCoursePayment,
  createStudentCoursePayment,
  enrollFreeStudentCourse,
  getStudentCatalogCategories,
  getStudentCatalogCourses,
  getStudentPaymentSettings,
} from "@/features/student-catalog/services/student-catalog.service";
import type {
  StudentCatalogCategory,
  StudentCatalogCourse,
  StudentCatalogCourseType,
  StudentCatalogFilters,
  StudentCatalogPayment,
  StudentPaymentSettings,
} from "@/features/student-catalog/types/student-catalog.types";

const CULQI_CHECKOUT_SCRIPT =
  "https://js.culqi.com/checkout-js";

const DEFAULT_STUDENT_PAYMENT_SETTINGS: StudentPaymentSettings = {
  processingFeePercentage: 4.02,
  processingFeeTaxPercentage: 0,
  passProcessingFeeToStudent: true,
  culqiPaymentsEnabled: true,
  manualPaymentsEnabled: true,
};

interface CulqiCheckoutInstance {
  token?: {
    id?: string;
  };
  order?: {
    id?: string;
  };
  error?: {
    code?: string;
    user_message?: string;
    merchant_message?: string;
  };
  culqi?: () => void;
  open: () => void;
  close: () => void;
}

interface CulqiCheckoutConfig {
  settings: {
    title: string;
    currency: string;
    amount: number;
    order?: string;
    xculqirsaid?: string;
    rsapublickey?: string;
  };
  client: {
    email: string;
  };
  options: {
    lang: "es";
    installments: boolean;
    modal: boolean;
    paymentMethods: {
      tarjeta: boolean;
      yape: boolean;
      billetera: boolean;
      bancaMovil: boolean;
      agente: boolean;
      cuotealo: boolean;
    };
    paymentMethodsSort: string[];
  };
  appearance: {
    theme: "default";
    hiddenCulqiLogo: boolean;
    hiddenBannerContent: boolean;
    hiddenBanner: boolean;
    hiddenToolBarAmount: boolean;
    hiddenEmail: boolean;
    menuType: "sidebar";
    buttonCardPayText: string;
  };
}

declare global {
  interface Window {
    CulqiCheckout?: new (
      publicKey: string,
      config: CulqiCheckoutConfig
    ) => CulqiCheckoutInstance;
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

type CulqiPaymentResult =
  | {
      type: "TOKEN";
      sourceId: string;
    }
  | {
      type: "ORDER";
    };

class CulqiCheckoutError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "CulqiCheckoutError";
    this.code = code;
  }
}

class CulqiCheckoutClosedError extends Error {
  constructor() {
    super("Checkout cerrado por el usuario.");
    this.name = "CulqiCheckoutClosedError";
  }
}

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
  const [paymentSettings, setPaymentSettings] =
    useState<StudentPaymentSettings>(DEFAULT_STUDENT_PAYMENT_SETTINGS);
  const [processingPaymentId, setProcessingPaymentId] =
    useState<number | null>(null);
  const [preparingOrderPaymentId, setPreparingOrderPaymentId] =
    useState<number | null>(null);
  const [submittingManualPaymentId, setSubmittingManualPaymentId] =
    useState<number | null>(null);
  const [isCulqiCheckoutOpen, setIsCulqiCheckoutOpen] =
    useState(false);
  const paymentLocksRef = useRef<Set<number>>(new Set());
  const paymentAttemptCountRef = useRef(0);
  const isOpeningCulqiCheckoutRef = useRef(false);

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

  const loadPaymentSettings = useCallback(async () => {
    try {
      setPaymentSettings(await getStudentPaymentSettings());
    } catch (error) {
      console.warn(
        "No se pudo cargar la configuración de pagos",
        getApiErrorMessage(error)
      );
      setPaymentSettings(DEFAULT_STUDENT_PAYMENT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCategories();
      void loadPaymentSettings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isChecking, loadCategories, loadPaymentSettings]);

  useEffect(() => {
    if (isChecking) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCatalog();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isChecking, loadCatalog]);

  useEffect(() => {
    if (isChecking || !paymentSettings.culqiPaymentsEnabled) {
      return;
    }

    void loadCulqiCheckout().catch((error) => {
      console.warn(
        "No se pudo precargar Culqi Checkout",
        error
      );
    });
  }, [isChecking, paymentSettings.culqiPaymentsEnabled]);

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

      const [payment] = await Promise.all([
        createStudentCoursePayment(course.id),
        paymentSettings.culqiPaymentsEnabled
          ? loadCulqiCheckout().catch((error) => {
              console.warn(
                "No se pudo precargar Culqi Checkout",
                error
              );
            })
          : Promise.resolve(),
      ]);

      setPendingPayment(payment);
      if (paymentSettings.culqiPaymentsEnabled) {
        void prepareCulqiOrder(payment);
      }

      toast.warning("Pago pendiente creado.", {
        description:
          "Completa el pago para activar tu matrícula.",
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
    if (paymentLocksRef.current.has(payment.id)) {
      return;
    }

    paymentLocksRef.current.add(payment.id);
    paymentAttemptCountRef.current += 1;

    try {
      setProcessingPaymentId(payment.id);
      isOpeningCulqiCheckoutRef.current = true;

      setPendingPayment(null);

      console.info("Culqi payment function executed", {
        paymentId: payment.id,
        executionCount: paymentAttemptCountRef.current,
        executedAt: new Date().toISOString(),
      });

      const paymentWithOrder =
        await ensureCulqiOrder(payment);
      const culqiResult =
        await requestCulqiPayment(
          paymentWithOrder,
          setIsCulqiCheckoutOpen
        );

      const updatedPayment =
        culqiResult.type === "TOKEN"
          ? await createCulqiCharge(
              paymentWithOrder.id,
              culqiResult.sourceId
            )
          : paymentWithOrder;

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

        setPendingPayment(null);

        toast.success("Pago confirmado.", {
          description:
            updatedPayment.courseTitle,
        });
      } else if (culqiResult.type === "ORDER") {
        setPendingPayment(updatedPayment);
      } else {
        setPendingPayment(updatedPayment);

        toast.error("Pago no confirmado.", {
          description:
            "Culqi no aprobó la operación.",
        });
      }
    } catch (error) {
      if (error instanceof CulqiCheckoutClosedError) {
        try {
          await cancelStudentCoursePayment(payment.id);
        } catch (cancelError) {
          console.warn(
            "No se pudo cancelar el pago pendiente",
            getApiErrorMessage(cancelError)
          );
        }

        setPendingPayment(null);

        toast.info("Pago cancelado.", {
          description:
            "Puedes volver al catálogo y elegir el curso correcto.",
        });
        return;
      }

      setPendingPayment(payment);

      toast.error("No se pudo procesar el pago.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      isOpeningCulqiCheckoutRef.current = false;
      paymentLocksRef.current.delete(payment.id);
      setProcessingPaymentId(null);
    }
  }

  async function handleManualPaymentSubmit(
    payment: StudentCatalogPayment,
    method: string,
    reference: string,
    file: File
  ): Promise<void> {
    try {
      setSubmittingManualPaymentId(payment.id);

      const manualPayment =
        await createManualStudentCoursePayment(
          payment.courseId,
          method,
          reference,
          file
        );

      setPendingPayment(manualPayment);

      toast.warning("Comprobante enviado.", {
        description:
          "Revisaremos tu pago y activaremos la matrícula cuando sea aprobado.",
      });
    } catch (error) {
      toast.error("No se pudo enviar el comprobante.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setSubmittingManualPaymentId(null);
    }
  }

  async function prepareCulqiOrder(
    payment: StudentCatalogPayment
  ): Promise<void> {
    if (payment.providerOrderId) {
      return;
    }

    try {
      setPreparingOrderPaymentId(payment.id);

      const paymentWithOrder =
        await createCulqiOrder(payment.id);

      setPendingPayment((currentPayment) =>
        currentPayment?.id === payment.id
          ? paymentWithOrder
          : currentPayment
      );
    } catch (error) {
      console.warn(
        "No se pudo preparar la orden Culqi en segundo plano",
        getApiErrorMessage(error)
      );
    } finally {
      setPreparingOrderPaymentId((currentId) =>
        currentId === payment.id ? null : currentId
      );
    }
  }

  async function ensureCulqiOrder(
    payment: StudentCatalogPayment
  ): Promise<StudentCatalogPayment> {
    return createCulqiOrder(payment.id);
  }

  async function handleClosePendingPayment(): Promise<void> {
    const payment = pendingPayment;

    setPendingPayment(null);

    if (!payment || payment.status !== "PENDING") {
      return;
    }

    try {
      await cancelStudentCoursePayment(payment.id);
    } catch (error) {
      console.warn(
        "No se pudo cancelar el pago pendiente",
        getApiErrorMessage(error)
      );
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
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
          key={pendingPayment?.id ?? "empty-payment"}
          payment={pendingPayment}
          isProcessing={
            pendingPayment !== null &&
            processingPaymentId === pendingPayment.id
          }
          isPreparingOrder={
            pendingPayment !== null &&
            preparingOrderPaymentId === pendingPayment.id
          }
          isSubmittingManual={
            pendingPayment !== null &&
            submittingManualPaymentId === pendingPayment.id
          }
          paymentSettings={paymentSettings}
          onPay={handlePayWithCulqi}
          onManualSubmit={handleManualPaymentSubmit}
          onOpenChange={(open) => {
            if (!open) {
              if (isOpeningCulqiCheckoutRef.current) {
                return;
              }

              void handleClosePendingPayment();
            }
          }}
        />

        {isCulqiCheckoutOpen && (
          <div
            className="pointer-events-none fixed inset-0 z-40 bg-background/25 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
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
  isPreparingOrder,
  isSubmittingManual,
  paymentSettings,
  onPay,
  onManualSubmit,
  onOpenChange,
}: {
  payment: StudentCatalogPayment | null;
  isProcessing: boolean;
  isPreparingOrder: boolean;
  isSubmittingManual: boolean;
  paymentSettings: StudentPaymentSettings;
  onPay: (
    payment: StudentCatalogPayment
  ) => Promise<void>;
  onManualSubmit: (
    payment: StudentCatalogPayment,
    method: string,
    reference: string,
    file: File
  ) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const [manualMethod, setManualMethod] = useState("Yape");
  const [manualReference, setManualReference] = useState("");
  const [manualProofFile, setManualProofFile] =
    useState<File | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const canSubmitManual =
    payment !== null &&
    manualMethod.trim().length > 0 &&
    manualProofFile !== null &&
    !isSubmittingManual;

  return (
    <Dialog
      open={payment !== null}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={
          showManualForm
            ? "max-h-[88vh] overflow-y-auto sm:max-w-3xl"
            : "sm:max-w-md"
        }
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {payment?.status === "PAID"
              ? "Pago confirmado"
              : "Pago pendiente"}
          </DialogTitle>

          <DialogDescription>
            {payment?.status === "PAID"
              ? "Tu matrícula ya fue activada."
              : showManualForm
                ? "Envía tu comprobante para revisión administrativa."
                : "Completa el pago con Culqi o envía tu comprobante para revisión."}
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <div
            className={
              showManualForm
                ? "grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                : "space-y-4"
            }
          >
            <div className="rounded-lg border bg-muted/30 p-4 self-start">
              <p className="text-sm font-medium">
                {payment.courseTitle}
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatPrice(payment.totalAmount ?? payment.amount)}
              </p>

              <div className="mt-4 rounded-md bg-background p-3 text-sm">
                <div className="flex items-center justify-between gap-3 font-medium">
                  <span>Precio del curso</span>
                  <span className="shrink-0">
                    {formatPrice(
                      payment.totalAmount ?? payment.amount
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {translatePaymentStatus(payment.status)}
                </Badge>
                {!showManualForm && (
                  <Badge variant="outline">
                    {payment.provider}
                  </Badge>
                )}
                {showManualForm && (
                  <Badge variant="outline">
                    MANUAL
                  </Badge>
                )}
              </div>

              {showManualForm && (
                <div className="mt-4 rounded-md bg-background p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    Solicitante
                  </p>
                  <p className="mt-1 font-medium">
                    {payment.studentFullName}
                  </p>
                </div>
              )}
            </div>

            {showManualForm && (
              <Alert className="md:hidden">
                <AlertTitle>Revisión administrativa</AlertTitle>
                <AlertDescription>
                  Validaremos tu comprobante antes de activar la matrícula.
                </AlertDescription>
              </Alert>
            )}

            {!showManualForm && (
              <Alert>
                <AlertTitle>
                  {payment.status === "PAID"
                    ? "Matrícula activada"
                    : payment.provider === "MANUAL"
                      ? "Comprobante en revisión"
                      : "Pago seguro"}
                </AlertTitle>
                <AlertDescription>
                  {payment.status === "PAID"
                    ? "Ya puedes ingresar al curso desde tus cursos matriculados."
                    : payment.provider === "MANUAL"
                      ? "Validaremos tu comprobante antes de activar la matrícula."
                      : "Validaremos tu pago de forma segura antes de activar tu matrícula."}
                </AlertDescription>
              </Alert>
            )}

            {payment.status === "PENDING" &&
              payment.provider !== "MANUAL" &&
              showManualForm &&
              paymentSettings.manualPaymentsEnabled && (
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Registrar pago manual</p>
                    <p className="text-sm text-muted-foreground">
                      Ingresa el canal usado y adjunta tu comprobante.
                      Revisaremos el pago antes de activar tu matrícula.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-2 text-sm font-medium">
                    Método de pago
                    <Input
                      value={manualMethod}
                      onChange={(event) =>
                        setManualMethod(event.target.value)
                      }
                      placeholder="Yape, Plin, transferencia"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Operación o referencia
                    <Input
                      value={manualReference}
                      onChange={(event) =>
                        setManualReference(event.target.value)
                      }
                      placeholder="Opcional"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Comprobante
                    <Input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={(event) =>
                        setManualProofFile(
                          event.target.files?.[0] ?? null
                        )
                      }
                    />
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canSubmitManual}
                    onClick={() => {
                      if (payment && manualProofFile) {
                        void onManualSubmit(
                          payment,
                          manualMethod,
                          manualReference,
                          manualProofFile
                        );
                      }
                    }}
                  >
                    {isSubmittingManual ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ReceiptText className="mr-2 h-4 w-4" />
                    )}
                    Enviar comprobante
                  </Button>
                </div>
              </div>
            )}

            {payment.status === "REJECTED" && (
              <Alert variant="destructive">
                <AlertTitle>Comprobante rechazado</AlertTitle>
                <AlertDescription>
                  {payment.manualRejectionReason ??
                    "Envía un nuevo comprobante para continuar."}
                </AlertDescription>
              </Alert>
            )}

            {payment.status === "PENDING" &&
              !paymentSettings.culqiPaymentsEnabled &&
              !paymentSettings.manualPaymentsEnabled && (
                <Alert variant="destructive">
                  <AlertTitle>Métodos no disponibles</AlertTitle>
                  <AlertDescription>
                    No hay métodos de pago activos en este momento.
                    Intenta nuevamente más tarde.
                  </AlertDescription>
                </Alert>
              )}
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

          {payment?.status === "PENDING" &&
            payment.provider !== "MANUAL" &&
            !showManualForm &&
            paymentSettings.culqiPaymentsEnabled && (
              <Button
                type="button"
                disabled={
                  isProcessing ||
                  isPreparingOrder ||
                  isSubmittingManual
                }
                onClick={() => void onPay(payment)}
              >
                {isProcessing || isPreparingOrder ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {isPreparingOrder
                  ? "Preparando Culqi"
                  : "Pagar con Culqi"}
              </Button>
          )}

          {payment?.status === "PENDING" &&
            payment.provider !== "MANUAL" &&
            paymentSettings.manualPaymentsEnabled &&
            !showManualForm && (
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing || isPreparingOrder}
                onClick={() => setShowManualForm(true)}
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                Pagar manual
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

async function requestCulqiPayment(
  payment: StudentCatalogPayment,
  setCheckoutOpen: (open: boolean) => void
): Promise<CulqiPaymentResult> {
  const publicKey =
    process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
  const rsaId =
    process.env.NEXT_PUBLIC_CULQI_RSA_ID;
  const rsaPublicKey =
    process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "La clave pública de Culqi no está configurada."
    );
  }

  if (
    payment.providerOrderId &&
    (!rsaId || !rsaPublicKey)
  ) {
    throw new Error(
      "Faltan las claves RSA públicas de Culqi para habilitar pagos con QR."
    );
  }

  await loadCulqiCheckout();

  return new Promise((resolve, reject) => {
    if (!window.CulqiCheckout) {
      reject(
        new Error(
          "No se pudo cargar el checkout de Culqi."
        )
      );
      return;
    }

    let settled = false;
    let orderGenerated = false;
    let errorCheckIntervalId: number | null = null;
    let timeoutId: number | null = null;
    let stopCloseWatcher: (() => void) | null = null;

    const clearWatchers = () => {
      if (errorCheckIntervalId !== null) {
        window.clearInterval(errorCheckIntervalId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      stopCloseWatcher?.();
      stopCloseWatcher = null;
    };

    const closeCheckoutState = () => {
      setCheckoutOpen(false);
    };

    const rejectWithCheckoutError = (
      checkout: CulqiCheckoutInstance
    ) => {
      if (settled) {
        return;
      }

      const message =
        checkout.error?.user_message ??
        checkout.error?.merchant_message ??
        "Culqi no pudo validar el pago. Intenta nuevamente o usa otro método.";

      settled = true;
      clearWatchers();
      closeCheckoutState();
      console.error("Culqi checkout error", checkout.error);
      checkout.close();
      reject(
        new CulqiCheckoutError(
          message,
          checkout.error?.code
        )
      );
    };

    const paymentMethods = {
        tarjeta: true,
        yape: true,
        billetera: Boolean(payment.providerOrderId),
        bancaMovil: false,
        agente: false,
        cuotealo: false,
    };

    const checkout = new window.CulqiCheckout(
      publicKey,
      {
        settings: {
          title: payment.courseTitle,
          currency: payment.currency,
          amount: Math.round(
            (payment.totalAmount ?? payment.amount) * 100
          ),
          ...(payment.providerOrderId
            ? { order: payment.providerOrderId }
            : {}),
          ...(rsaId && rsaPublicKey
            ? {
                xculqirsaid: rsaId,
                rsapublickey: rsaPublicKey,
              }
            : {}),
        },
        client: {
          email: payment.studentEmail,
        },
        options: {
          lang: "es",
          installments: false,
          modal: true,
          paymentMethods,
          paymentMethodsSort:
            Object.keys(paymentMethods),
        },
        appearance: {
          theme: "default",
          hiddenCulqiLogo: false,
          hiddenBannerContent: false,
          hiddenBanner: false,
          hiddenToolBarAmount: false,
          hiddenEmail: true,
          menuType: "sidebar",
          buttonCardPayText: "Pagar",
        },
      }
    );

    console.info(
      "Opening Culqi checkout",
      {
        paymentId: payment.id,
        providerOrderId: payment.providerOrderId,
        providerOrderStatus:
          payment.providerOrderStatus,
        providerOrderExpiresAt:
          payment.providerOrderExpiresAt,
        openedAt: new Date().toISOString(),
      }
    );

    checkout.culqi = () => {
      const tokenId = checkout.token?.id;
      const orderId = checkout.order?.id;

      if (tokenId) {
        if (settled) {
          return;
        }

        settled = true;
        clearWatchers();
        closeCheckoutState();
        checkout.close();
        resolve({
          type: "TOKEN",
          sourceId: tokenId,
        });
        return;
      }

      if (orderId) {
        if (settled) {
          return;
        }

        orderGenerated = true;
        return;
      }

      rejectWithCheckoutError(checkout);
    };

    errorCheckIntervalId = window.setInterval(() => {
      if (checkout.error) {
        rejectWithCheckoutError(checkout);
      }
    }, 500);

    timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      clearWatchers();
      closeCheckoutState();
      checkout.close();
      reject(
        new Error(
          "Culqi tardó demasiado en responder. Intenta nuevamente."
        )
      );
    }, 120000);

    setCheckoutOpen(true);
    checkout.open();
    stopCloseWatcher = watchCulqiCheckoutClose(() => {
      if (settled) {
        return;
      }

      settled = true;
      clearWatchers();
      closeCheckoutState();

      if (orderGenerated) {
        resolve({
          type: "ORDER",
        });
        return;
      }

      reject(
        new CulqiCheckoutClosedError()
      );
    });
  });
}

function watchCulqiCheckoutClose(
  onClose: () => void
): () => void {
  let hasSeenCheckout = hasVisibleCulqiCheckout();

  const observer = new MutationObserver(() => {
    const isVisible = hasVisibleCulqiCheckout();

    if (isVisible) {
      hasSeenCheckout = true;
      return;
    }

    if (hasSeenCheckout) {
      observer.disconnect();
      onClose();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  window.setTimeout(() => {
    hasSeenCheckout = hasSeenCheckout ||
      hasVisibleCulqiCheckout();
  }, 250);

  return () => observer.disconnect();
}

function hasVisibleCulqiCheckout(): boolean {
  const elements = document.querySelectorAll(
    "iframe[src*='culqi'], [id*='culqi' i], [class*='culqi' i]"
  );

  return Array.from(elements).some((element) => {
    if (!(element instanceof HTMLElement)) {
      return true;
    }

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      Number(style.opacity) !== 0
    );
  });
}

function loadCulqiCheckout(): Promise<void> {
  if (window.CulqiCheckout) {
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

function translatePaymentStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    PAID: "Pagado",
    FAILED: "Fallido",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
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
