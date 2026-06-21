"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    GraduationCap,
    Loader2,
    Medal,
    Users,
    Wallet,
    } from "lucide-react";

    import { DashboardShell } from "@/components/layout/dashboard-shell";
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Badge } from "@/components/ui/badge";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    getRevenueByMonth,
    getTopCourses,
    } from "@/features/dashboard/services/admin-dashboard.service";
    import type {
    AdminDashboardSummary,
    LatestEnrollment,
    LatestStudent,
    RevenueByMonth,
    TopCourse,
    } from "@/features/dashboard/types/admin-dashboard.types";

    export function AdminDashboardClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [students, setStudents] = useState<LatestStudent[]>([]);
    const [enrollments, setEnrollments] = useState<LatestEnrollment[]>([]);
    const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
    const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
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
            getRevenueByMonth(),
            ]);

            setSummary(summaryData);
            setStudents(latestStudentsData);
            setEnrollments(latestEnrollmentsData);
            setTopCourses(topCoursesData);
            setRevenue(revenueData);
        } catch {
            setError("No se pudo cargar el dashboard administrativo.");
        } finally {
            setIsLoading(false);
        }
        }

        loadDashboard();
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
            <AdminMetricCard title="Estudiantes" value={summary.totalStudents} description="Usuarios estudiantes" icon={Users} />
            <AdminMetricCard title="Instructores" value={summary.totalInstructors} description="Usuarios instructores" icon={GraduationCap} />
            <AdminMetricCard title="Cursos" value={summary.totalCourses} description={`${summary.publishedCourses} publicados`} icon={BookOpen} />
            <AdminMetricCard title="Matrículas" value={summary.totalEnrollments} description={`${summary.completedEnrollments} completadas`} icon={Medal} />
            <AdminMetricCard title="Certificados" value={summary.totalCertificates} description="Certificados generados" icon={Medal} />
            <AdminMetricCard title="Ingresos" value={`S/ ${summary.totalRevenue.toFixed(2)}`} description="Ingresos totales" icon={Wallet} />
            </div>
        )}

        {!isLoading && (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
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

    function AdminMetricCard({ title, value, description, icon: Icon }: AdminMetricCardProps) {
    return (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </CardContent>
        </Card>
    );
    }

    function StudentsTable({ students }: { students: LatestStudent[] }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Últimos estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
            <TableBody>
                {students.map((student) => (
                <TableRow key={student.id}>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell><Badge variant="secondary">{student.status}</Badge></TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }

    function EnrollmentsTable({ enrollments }: { enrollments: LatestEnrollment[] }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Últimas matrículas</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader><TableRow><TableHead>Estudiante</TableHead><TableHead>Curso</TableHead><TableHead>Progreso</TableHead></TableRow></TableHeader>
            <TableBody>
                {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                    <TableCell>{enrollment.studentEmail}</TableCell>
                    <TableCell>{enrollment.courseTitle}</TableCell>
                    <TableCell>{enrollment.progressPercentage}%</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }

    function TopCoursesTable({ courses }: { courses: TopCourse[] }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Cursos más matriculados</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader><TableRow><TableHead>Curso</TableHead><TableHead>Matrículas</TableHead></TableRow></TableHeader>
            <TableBody>
                {courses.map((course) => (
                <TableRow key={course.courseId}>
                    <TableCell>{course.courseTitle}</TableCell>
                    <TableCell>{course.totalEnrollments}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }

    function RevenueTable({ revenue }: { revenue: RevenueByMonth[] }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Ingresos mensuales</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader><TableRow><TableHead>Mes</TableHead><TableHead>Ingreso</TableHead></TableRow></TableHeader>
            <TableBody>
                {revenue.map((item) => (
                <TableRow key={item.month}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>S/ {item.revenue.toFixed(2)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
}