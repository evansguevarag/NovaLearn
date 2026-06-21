"use client";

import { useCallback, useEffect, useState } from "react";
import {
    BookOpen,
    CheckCircle2,
    CircleDollarSign,
    FilePenLine,
    GraduationCap,
    Users,
    } from "lucide-react";

    import { DashboardShell } from "@/components/layout/dashboard-shell";
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Badge } from "@/components/ui/badge";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Progress } from "@/components/ui/progress";
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

    import {
    getInstructorCourses,
    getInstructorDashboard,
    getInstructorEnrollments,
    } from "@/features/instructor-dashboard/services/instructor-dashboard.service";

    import type {
    InstructorCourse,
    InstructorDashboardSummary,
    InstructorEnrollment,
    } from "@/features/instructor-dashboard/types/instructor-dashboard.types";

    export function InstructorDashboardClient() {
    const { isChecking } = useAuthGuard(["INSTRUCTOR"]);

    const [summary, setSummary] =
        useState<InstructorDashboardSummary | null>(null);
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [enrollments, setEnrollments] = useState<InstructorEnrollment[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        try {
        setIsLoading(true);
        setError(null);

        const [summaryData, coursesData, enrollmentsData] = await Promise.all([
            getInstructorDashboard(),
            getInstructorCourses(),
            getInstructorEnrollments(),
        ]);

        setSummary(summaryData);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo cargar el dashboard del instructor."
            )
        );
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isChecking) return;

        const timeoutId = window.setTimeout(() => {
        void loadDashboard();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isChecking, loadDashboard]);

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Dashboard del instructor"
        description="Consulta tus cursos, estudiantes, matrículas e ingresos."
        >
        <div className="space-y-6">
            {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}

            {isLoading ? (
            <DashboardSkeleton />
            ) : summary ? (
            <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Cursos totales"
                    value={summary.totalCourses}
                    description="Cursos asignados"
                    icon={BookOpen}
                />

                <SummaryCard
                    title="Cursos publicados"
                    value={summary.publishedCourses}
                    description="Disponibles para estudiantes"
                    icon={GraduationCap}
                />

                <SummaryCard
                    title="Matrículas"
                    value={summary.totalEnrollments}
                    description={`${summary.completedEnrollments} completadas`}
                    icon={Users}
                />

                <SummaryCard
                    title="Ingresos"
                    value={formatCurrency(summary.totalRevenue)}
                    description="Ingresos generados"
                    icon={CircleDollarSign}
                />
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5" />
                        Mis cursos
                    </CardTitle>
                    </CardHeader>

                    <CardContent>
                    <CoursesTable courses={courses} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5" />
                        Matrículas recientes
                    </CardTitle>
                    </CardHeader>

                    <CardContent>
                    <EnrollmentsTable enrollments={enrollments} />
                    </CardContent>
                </Card>
                </section>
            </>
            ) : (
            <Alert>
                <AlertTitle>Sin información</AlertTitle>
                <AlertDescription>
                No se encontró información para este instructor.
                </AlertDescription>
            </Alert>
            )}
        </div>
        </DashboardShell>
    );
    }

    interface SummaryCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: React.ElementType;
    }

    function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    }: SummaryCardProps) {
    return (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>

            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
            <p className="text-2xl font-bold">{value}</p>

            <p className="mt-1 text-xs text-muted-foreground">
            {description}
            </p>
        </CardContent>
        </Card>
    );
    }

    interface CoursesTableProps {
    courses: InstructorCourse[];
    }

    function CoursesTable({ courses }: CoursesTableProps) {
    if (courses.length === 0) {
        return (
        <EmptyState
            icon={FilePenLine}
            title="Aún no tienes cursos"
            description="Los cursos asignados aparecerán en esta sección."
        />
        );
    }

    return (
        <div className="overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {courses.map((course) => (
                <TableRow key={course.id}>
                <TableCell>
                    <p className="font-medium">{course.title}</p>

                    <p className="text-xs text-muted-foreground">
                    {course.categoryName} · {course.level}
                    </p>
                </TableCell>

                <TableCell>
                    <Badge
                    variant={
                        course.status === "PUBLISHED"
                        ? "default"
                        : "secondary"
                    }
                    >
                    {translateCourseStatus(course.status)}
                    </Badge>
                </TableCell>

                <TableCell>{formatCurrency(course.price)}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    );
    }

    interface EnrollmentsTableProps {
    enrollments: InstructorEnrollment[];
    }

    function EnrollmentsTable({
    enrollments,
    }: EnrollmentsTableProps) {
    if (enrollments.length === 0) {
        return (
        <EmptyState
            icon={Users}
            title="Aún no hay matrículas"
            description="Los estudiantes matriculados aparecerán aquí."
        />
        );
    }

    return (
        <div className="overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="min-w-48">Estudiante</TableHead>
                <TableHead className="min-w-64">Curso</TableHead>
                <TableHead className="w-44">Progreso</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {enrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollmentId}>
                <TableCell>
                    <p className="font-medium">{enrollment.studentName}</p>

                    <p className="text-xs text-muted-foreground">
                    {enrollment.studentEmail}
                    </p>
                </TableCell>

                <TableCell className="max-w-72 whitespace-normal">
                {enrollment.courseTitle}
                </TableCell>

                <TableCell className="w-44">
                    <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span>{enrollment.progressPercentage}%</span>

                        {enrollment.completedAt && (
                        <CheckCircle2 className="h-4 w-4" />
                        )}
                    </div>

                    <Progress value={enrollment.progressPercentage} />
                    </div>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    );
    }

    interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    }

    function EmptyState({
    icon: Icon,
    title,
    description,
    }: EmptyStateProps) {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
            <Icon className="h-6 w-6 text-muted-foreground" />
        </div>

        <p className="font-medium">{title}</p>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {description}
        </p>
        </div>
    );
    }

    function DashboardSkeleton() {
    return (
        <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
                <CardHeader>
                <Skeleton className="h-4 w-28" />
                </CardHeader>

                <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-36" />
                </CardContent>
            </Card>
            ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
                <CardHeader>
                <Skeleton className="h-5 w-40" />
                </CardHeader>

                <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <Skeleton key={rowIndex} className="h-12 w-full" />
                ))}
                </CardContent>
            </Card>
            ))}
        </div>
        </div>
    );
    }

    function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(value);
    }

    function translateCourseStatus(status: string): string {
    const statuses: Record<string, string> = {
        PUBLISHED: "Publicado",
        DRAFT: "Borrador",
        ARCHIVED: "Archivado",
    };

    return statuses[status] ?? status;
}