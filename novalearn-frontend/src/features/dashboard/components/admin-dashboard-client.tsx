"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    ArrowRight,
    GraduationCap,
    Loader2,
    Medal,
    Users,
    Wallet,
    } from "lucide-react";
import Link from "next/link";

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
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table";
    import { useAuthGuard } from "@/hooks/use-auth-guard";

    import {
    getAdminDashboardSummary,
    getLatestEnrollments,
    getLatestStudents,
    getRevenue,
    getTopCourses,
    } from "@/features/dashboard/services/admin-dashboard.service";

    import type {
    AdminDashboardSummary,
    LatestEnrollment,
    LatestStudent,
    RevenuePayment,
    TopCourse,
    } from "@/features/dashboard/types/admin-dashboard.types";

    export function AdminDashboardClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [summary, setSummary] =
        useState<AdminDashboardSummary | null>(null);
    const [students, setStudents] = useState<LatestStudent[]>([]);
    const [enrollments, setEnrollments] =
        useState<LatestEnrollment[]>([]);
    const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
    const [revenue, setRevenue] = useState<RevenuePayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isChecking) return;

        async function loadDashboard() {
        try {
            setIsLoading(true);
            setError(null);

            const [
            summaryData,
            latestStudentsData,
            latestEnrollmentsData,
            topCoursesData,
            revenueData,
            ] = await Promise.all([
            getAdminDashboardSummary(),
            getLatestStudents(),
            getLatestEnrollments(),
            getTopCourses(),
            getRevenue(),
            ]);

            setSummary(summaryData);
            setStudents(latestStudentsData);
            setEnrollments(latestEnrollmentsData);
            setTopCourses(topCoursesData);
            setRevenue(revenueData);
        } catch {
            setError(
            "No se pudo cargar el dashboard administrativo."
            );
        } finally {
            setIsLoading(false);
        }
        }

        void loadDashboard();
    }, [isChecking]);

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Dashboard Administrador"
        description="Resumen general de estudiantes, cursos, matrículas e ingresos."
        >
        {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando información...
            </div>
        )}

        {error && (
            <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {summary && !isLoading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard
                title="Estudiantes"
                value={summary.totalStudents}
                description="Usuarios estudiantes"
                icon={Users}
            />

            <AdminMetricCard
                title="Instructores"
                value={summary.totalInstructors}
                description="Usuarios instructores"
                icon={GraduationCap}
            />

            <AdminMetricCard
                title="Cursos"
                value={summary.totalCourses}
                description={`${summary.publishedCourses} publicados`}
                icon={BookOpen}
            />

            <AdminMetricCard
                title="Matrículas"
                value={summary.totalEnrollments}
                description={`${summary.completedEnrollments} completadas`}
                icon={Medal}
            />

            <AdminMetricCard
                title="Certificados"
                value={summary.totalCertificates}
                description="Certificados generados"
                icon={Medal}
            />

            <AdminMetricCard
                title="Ingresos"
                value={formatCurrency(summary.totalRevenue)}
                description="Ingresos totales"
                icon={Wallet}
            />
            </div>
        )}

        {!isLoading && (
            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <StudentsTable students={students} />
            <EnrollmentsTable enrollments={enrollments} />
            <TopCoursesTable courses={topCourses} />
            <RevenueTable revenue={revenue} />
            </div>
        )}
        </DashboardShell>
    );
    }

    interface AdminMetricCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    }

    function AdminMetricCard({
    title,
    value,
    description,
    icon: Icon,
    }: AdminMetricCardProps) {
    return (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
            </CardTitle>

            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
            <p className="text-3xl font-bold">{value}</p>

            <p className="mt-1 text-sm text-muted-foreground">
            {description}
            </p>
        </CardContent>
        </Card>
    );
    }

    function StudentsTable({
    students,
    }: {
    students: LatestStudent[];
    }) {
    return (
        <DashboardTableCard title="Últimos estudiantes">
        <Table className="table-fixed">
            <TableHeader>
            <TableRow>
                <TableHead className="w-[30%] whitespace-normal">
                Nombre
                </TableHead>

                <TableHead className="w-[45%] whitespace-normal">
                Correo
                </TableHead>

                <TableHead className="w-[25%] whitespace-normal text-center">
                Estado
                </TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {students.map((student) => (
                <TableRow key={student.id}>
                <TableCell className="whitespace-normal align-top">
                    <p className="break-words font-medium">
                    {student.firstName} {student.lastName}
                    </p>
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                    <p
                    className="break-all text-sm text-muted-foreground"
                    title={student.email}
                    >
                    {student.email}
                    </p>
                </TableCell>

                <TableCell className="whitespace-normal text-center align-top">
                    <StatusBadge status={student.status} />
                </TableCell>
                </TableRow>
            ))}

            {students.length === 0 && (
                <TableRow>
                <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                >
                    No hay estudiantes recientes.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </DashboardTableCard>
    );
    }

    function EnrollmentsTable({
    enrollments,
    }: {
    enrollments: LatestEnrollment[];
    }) {
    return (
        <DashboardTableCard title="Últimas matrículas">
        <Table className="table-fixed">
            <TableHeader>
            <TableRow>
                <TableHead className="w-[36%] whitespace-normal">
                Estudiante
                </TableHead>

                <TableHead className="w-[48%] whitespace-normal">
                Curso
                </TableHead>

                <TableHead className="w-[16%] whitespace-normal text-right">
                Progreso
                </TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                <TableCell className="whitespace-normal align-top">
                    <p
                    className="break-words text-sm"
                    title={enrollment.studentEmail ?? undefined}
                    >
                    {getEnrollmentStudentName(enrollment)}
                    </p>
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                    <p className="break-words leading-5">
                    {enrollment.courseTitle}
                    </p>
                </TableCell>

                <TableCell className="whitespace-normal text-right align-top font-medium">
                    {enrollment.progressPercentage}%
                </TableCell>
                </TableRow>
            ))}

            {enrollments.length === 0 && (
                <TableRow>
                <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                >
                    No hay matrículas recientes.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </DashboardTableCard>
    );
    }

    function TopCoursesTable({
    courses,
    }: {
    courses: TopCourse[];
    }) {
    return (
        <DashboardTableCard title="Cursos más matriculados">
        <Table className="table-fixed">
            <TableHeader>
            <TableRow>
                <TableHead className="w-[75%] whitespace-normal">
                Curso
                </TableHead>

                <TableHead className="w-[25%] whitespace-normal text-right">
                Matrículas
                </TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {courses.map((course) => (
                <TableRow key={course.courseId}>
                <TableCell className="whitespace-normal">
                    <p className="break-words">
                    {course.courseTitle}
                    </p>
                </TableCell>

                <TableCell className="text-right font-medium">
                    {course.totalEnrollments}
                </TableCell>
                </TableRow>
            ))}

            {courses.length === 0 && (
                <TableRow>
                <TableCell
                    colSpan={2}
                    className="py-8 text-center text-muted-foreground"
                >
                    No hay cursos con matrículas.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </DashboardTableCard>
    );
    }

    function RevenueTable({
    revenue,
    }: {
    revenue: RevenuePayment[];
    }) {
    const individualRevenue = revenue.filter(isIndividualRevenue);
    const totalRevenue = individualRevenue.reduce(
        (total, item) => total + getRevenueAmount(item),
        0
    );

    return (
        <DashboardTableCard
        title="Ingresos"
        action={
            <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            >
            <Link href="/admin/revenue">
                Ver ingresos
                <ArrowRight className="h-4 w-4" />
            </Link>
            </Button>
        }
        >
        <div className="mb-4 rounded-lg border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
            Total confirmado
            </p>
            <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalRevenue)}
            </p>
        </div>

        <Table className="table-fixed">
            <TableHeader>
            <TableRow>
                <TableHead className="w-[28%] whitespace-normal">
                Fecha
                </TableHead>

                <TableHead className="w-[46%] whitespace-normal">
                Curso vendido
                </TableHead>

                <TableHead className="w-[26%] whitespace-normal text-right">
                Importe
                </TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {individualRevenue.slice(0, 8).map((item, index) => (
                <TableRow key={buildRevenueRowKey(item, index)}>
                <TableCell className="whitespace-normal align-top">
                    {formatRevenueDate(item)}
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                    <p className="break-words font-medium leading-5">
                    {getRevenueCourseTitle(item)}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                    {getRevenueStudentName(item)}
                    </p>
                </TableCell>

                <TableCell className="text-right align-top font-medium">
                    {formatCurrency(getRevenueAmount(item))}
                </TableCell>
                </TableRow>
            ))}

            {individualRevenue.length === 0 && (
                <TableRow>
                <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                >
                    No hay ventas individuales registradas.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </DashboardTableCard>
    );
    }

    interface DashboardTableCardProps {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    }

    function DashboardTableCard({
    title,
    action,
    children,
    }: DashboardTableCardProps) {
    return (
        <Card className="flex h-[31rem] min-w-0 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg">{title}</CardTitle>
            {action}
        </CardHeader>

        <CardContent className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="h-full min-w-0 overflow-auto pr-1">
            {children}
            </div>
        </CardContent>
        </Card>
    );
    }

    function StatusBadge({ status }: { status: string }) {
    const labels: Record<string, string> = {
        ACTIVE: "Activo",
        INACTIVE: "Inactivo",
        PENDING_VERIFICATION: "Pendiente",
        SUSPENDED: "Suspendido",
        BLOCKED: "Bloqueado",
        DELETED: "Inactivo",
    };

    return (
        <Badge
        variant={status === "ACTIVE" ? "default" : "secondary"}
        className="max-w-full whitespace-normal break-words px-2 py-1 text-center leading-tight"
        >
        {labels[status] ?? status}
        </Badge>
    );
    }

    function formatCurrency(value: number): string {
    if (!Number.isFinite(value)) {
        return formatCurrency(0);
    }

    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(value);
}

    function formatFullDate(value: string | number[] | null): string {
    const date = parseDashboardDate(value);

    if (!date) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

    function parseDashboardDate(value: string | number[] | null): Date | null {
    if (!value) {
        return null;
    }

    if (Array.isArray(value)) {
        const [
        year,
        month,
        day,
        hour = 0,
        minute = 0,
        second = 0,
        ] = value;

        if (!year || !month || !day) {
        return null;
        }

        return new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second
        );
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
}

    function getEnrollmentStudentName(enrollment: LatestEnrollment): string {
    const studentName = enrollment.studentName?.trim();

    if (studentName) {
        return studentName;
    }

    return enrollment.studentEmail?.trim() || "Estudiante sin nombre";
}

    function getRevenueAmount(item: RevenuePayment): number {
    const amount = item.totalAmount ?? item.amount ?? 0;

    return Number.isFinite(amount) ? amount : 0;
}

    function getRevenueCourseTitle(item: RevenuePayment): string {
    return item.courseTitle?.trim() || "Curso no disponible";
}

    function getRevenueStudentName(item: RevenuePayment): string {
    return (
        item.studentName?.trim() ||
        item.studentEmail?.trim() ||
        "Estudiante no disponible"
    );
}

    function formatRevenueDate(item: RevenuePayment): string {
    if (item.paidAt) {
        return formatFullDate(item.paidAt);
    }

    return "Fecha no disponible";
}

    function buildRevenueRowKey(
    item: RevenuePayment,
    index: number
    ): string {
    if (item.paymentId) {
        return `payment-${item.paymentId}`;
    }

    return [
        "revenue",
        item.courseId ?? "course",
        item.studentId ?? "student",
        item.paidAt ?? "date",
        item.amount ?? "amount",
        index,
    ].join("-");
}

    function isIndividualRevenue(item: RevenuePayment): boolean {
    return Boolean(
        item.courseTitle &&
        (item.totalAmount != null || item.amount != null)
    );
}
