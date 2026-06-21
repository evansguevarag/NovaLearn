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
    getLatestStudents,
    } from "@/features/dashboard/services/admin-dashboard.service";
    import type {
    AdminDashboardSummary,
    LatestStudent,
    } from "@/features/dashboard/types/admin-dashboard.types";

    export function AdminDashboardClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [students, setStudents] = useState<LatestStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isChecking) return;

        async function loadDashboard() {
        try {
            setIsLoading(true);
            setError(null);

            const [summaryData, latestStudentsData] = await Promise.all([
            getAdminDashboardSummary(),
            getLatestStudents(),
            ]);

            setSummary(summaryData);
            setStudents(latestStudentsData);
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
            <AdminMetricCard
                title="Estudiantes"
                value={summary.totalStudents}
                description="Usuarios registrados como estudiantes"
                icon={Users}
            />

            <AdminMetricCard
                title="Instructores"
                value={summary.totalInstructors}
                description="Usuarios registrados como instructores"
                icon={GraduationCap}
            />

            <AdminMetricCard
                title="Cursos"
                value={summary.totalCourses}
                description={`${summary.publishedCourses} cursos publicados`}
                icon={BookOpen}
            />

            <AdminMetricCard
                title="Matrículas"
                value={summary.totalEnrollments}
                description={`${summary.completedEnrollments} cursos completados`}
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
                value={`S/ ${summary.totalRevenue.toFixed(2)}`}
                description="Ingresos totales confirmados"
                icon={Wallet}
            />
            </div>
        )}

        {!isLoading && (
            <Card className="mt-6">
            <CardHeader>
                <CardTitle>Últimos estudiantes registrados</CardTitle>
            </CardHeader>

            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {students.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                        <Badge variant="secondary">{student.status}</Badge>
                        </TableCell>
                        <TableCell>
                        {new Date(student.createdAt).toLocaleDateString("es-PE")}
                        </TableCell>
                    </TableRow>
                    ))}

                    {students.length === 0 && (
                    <TableRow>
                        <TableCell
                        className="py-6 text-center text-muted-foreground"
                        colSpan={4}
                        >
                        No hay estudiantes recientes.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
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
        <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </CardContent>
        </Card>
    );
}