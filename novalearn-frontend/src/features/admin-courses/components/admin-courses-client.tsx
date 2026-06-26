"use client";

import Link from "next/link";
import {
    BookOpen,
    CircleDollarSign,
    FilePenLine,
    Plus,
    Rocket,
    } from "lucide-react";
    import {
    useCallback,
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
    import { Button } from "@/components/ui/button";
    import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card";

    import { useAuthGuard } from "@/hooks/use-auth-guard";
    import { getApiErrorMessage } from "@/lib/get-api-error-message";

    import { CourseFilters } from "@/features/admin-courses/components/course-filters";
    import { CoursesTable } from "@/features/admin-courses/components/courses-table";
    import {
    getAdminCourses,
    getCourseCategories,
    } from "@/features/admin-courses/services/admin-course.service";

    import type {
    AdminCourse,
    CourseCategory,
    CourseStatus,
    CourseType,
    } from "@/features/admin-courses/types/admin-course.types";

    export function AdminCoursesClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [courses, setCourses] = useState<AdminCourse[]>([]);
    const [categories, setCategories] = useState<
        CourseCategory[]
    >([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<CourseStatus | "ALL">("ALL");
    const [typeFilter, setTypeFilter] =
        useState<CourseType | "ALL">("ALL");
    const [categoryFilter, setCategoryFilter] = useState<
        number | "ALL"
    >("ALL");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCourses = useCallback(async () => {
        try {
        setIsLoading(true);
        setError(null);

        const [coursesData, categoriesData] =
            await Promise.all([
            getAdminCourses(),
            getCourseCategories(),
            ]);

        setCourses(coursesData);
        setCategories(categoriesData);
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo cargar la gestión de cursos."
            )
        );
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isChecking) return;

        const timeoutId = window.setTimeout(() => {
        void loadCourses();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isChecking, loadCourses]);

    const filteredCourses = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return courses.filter((course) => {
        const matchesSearch =
            normalizedSearch.length === 0 ||
            course.title
            .toLowerCase()
            .includes(normalizedSearch) ||
            course.instructorEmail
            .toLowerCase()
            .includes(normalizedSearch) ||
            course.categoryName
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
            statusFilter === "ALL" ||
            course.status === statusFilter;

        const matchesType =
            typeFilter === "ALL" ||
            course.courseType === typeFilter;

        const matchesCategory =
            categoryFilter === "ALL" ||
            course.categoryId === categoryFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesCategory
        );
        });
    }, [
        courses,
        search,
        statusFilter,
        typeFilter,
        categoryFilter,
    ]);

    const totalPublished = courses.filter(
        (course) => course.status === "PUBLISHED"
    ).length;

    const totalDrafts = courses.filter(
        (course) => course.status === "DRAFT"
    ).length;

    const totalPaid = courses.filter(
        (course) => course.courseType === "PAID"
    ).length;

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Gestión de cursos"
        description="Administra el catálogo académico de NovaLearn."
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
                value={totalPublished}
                icon={Rocket}
            />

            <MetricCard
                title="Borradores"
                value={totalDrafts}
                icon={FilePenLine}
            />

            <MetricCard
                title="Cursos de pago"
                value={totalPaid}
                icon={CircleDollarSign}
            />
            </section>

            <Card className="min-w-0 overflow-hidden">
            <CardHeader className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-lg">
                    Catálogo de cursos
                    </CardTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                    {filteredCourses.length} de {courses.length}{" "}
                    cursos
                    </p>
                </div>

                <Button asChild>
                    <Link href="/admin/courses/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo curso
                    </Link>
                </Button>
                </div>

                <CourseFilters
                search={search}
                status={statusFilter}
                courseType={typeFilter}
                categoryId={categoryFilter}
                categories={categories}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                onCourseTypeChange={setTypeFilter}
                onCategoryChange={setCategoryFilter}
                />
            </CardHeader>

            <CardContent className="min-w-0">
                <CoursesTable
                courses={filteredCourses}
                isLoading={isLoading}
                />
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