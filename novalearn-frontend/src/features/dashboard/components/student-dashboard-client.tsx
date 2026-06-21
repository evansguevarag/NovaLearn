"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    CreditCard,
    Loader2,
    Medal,
    TrendingUp,
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
    getStudentCertificates,
    getStudentCourses,
    getStudentDashboardSummary,
    getStudentPayments,
    } from "@/features/dashboard/services/student-dashboard.service";
    import type {
    StudentCertificate,
    StudentCourse,
    StudentDashboardSummary,
    StudentPayment,
    } from "@/features/dashboard/types/student-dashboard.types";

    export function StudentDashboardClient() {
    const { isChecking } = useAuthGuard(["STUDENT"]);

    const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
    const [payments, setPayments] = useState<StudentPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isChecking) return;

        async function loadDashboard() {
        try {
            setIsLoading(true);
            setError(null);

            const [summaryData, coursesData, certificatesData, paymentsData] =
            await Promise.all([
                getStudentDashboardSummary(),
                getStudentCourses(),
                getStudentCertificates(),
                getStudentPayments(),
            ]);

            setSummary(summaryData);
            setCourses(coursesData);
            setCertificates(certificatesData);
            setPayments(paymentsData);
        } catch {
            setError("No se pudo cargar el dashboard del estudiante.");
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
        title="Dashboard Estudiante"
        description="Resumen de tus cursos, progreso, certificados y pagos."
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
            <StudentMetricCard
                title="Cursos inscritos"
                value={summary.enrolledCourses}
                description="Cursos activos en tu cuenta"
                icon={BookOpen}
            />

            <StudentMetricCard
                title="Cursos completados"
                value={summary.completedCourses}
                description="Cursos finalizados"
                icon={Medal}
            />

            <StudentMetricCard
                title="Certificados"
                value={summary.certificates}
                description="Certificados obtenidos"
                icon={Medal}
            />

            <StudentMetricCard
                title="Progreso promedio"
                value={`${summary.averageProgress}%`}
                description={`Total pagado: S/ ${summary.totalPaid.toFixed(2)}`}
                icon={TrendingUp}
            />
            </div>
        )}

        {!isLoading && (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <CoursesTable courses={courses} />
            <CertificatesTable certificates={certificates} />
            <PaymentsTable payments={payments} />
            </div>
        )}
        </DashboardShell>
    );
    }

    interface StudentMetricCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    }

    function StudentMetricCard({
    title,
    value,
    description,
    icon: Icon,
    }: StudentMetricCardProps) {
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

    function CoursesTable({ courses }: { courses: StudentCourse[] }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Mis cursos</CardTitle>
        </CardHeader>

        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Progreso</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {courses.map((course) => (
                <TableRow key={course.enrollmentId}>
                    <TableCell className="font-medium">
                    {course.courseTitle}
                    </TableCell>
                    <TableCell>{course.categoryName}</TableCell>
                    <TableCell>{course.progressPercentage}%</TableCell>
                </TableRow>
                ))}

                {courses.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                    No tienes cursos inscritos.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }

    function CertificatesTable({
    certificates,
    }: {
    certificates: StudentCertificate[];
    }) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Mis certificados</CardTitle>
        </CardHeader>

        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Completado</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {certificates.map((certificate) => (
                <TableRow key={certificate.enrollmentId}>
                    <TableCell className="font-medium">
                    {certificate.courseTitle}
                    </TableCell>
                    <TableCell>
                    {certificate.completedAt ? (
                        <Badge>Disponible</Badge>
                    ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                    )}
                    </TableCell>
                    <TableCell>
                    {certificate.completedAt
                        ? new Date(certificate.completedAt).toLocaleDateString("es-PE")
                        : "-"}
                    </TableCell>
                </TableRow>
                ))}

                {certificates.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                    No tienes certificados.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
    }

    function PaymentsTable({ payments }: { payments: StudentPayment[] }) {
    return (
        <Card className="xl:col-span-2">
        <CardHeader>
            <CardTitle>Mis pagos</CardTitle>
        </CardHeader>

        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Proveedor</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {payments.map((payment) => (
                <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                    {payment.courseTitle}
                    </TableCell>
                    <TableCell>
                    {payment.currency} {payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                    <Badge
                        variant={
                        payment.status === "PAID" ? "default" : "secondary"
                        }
                    >
                        {payment.status}
                    </Badge>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {payment.provider}
                    </div>
                    </TableCell>
                </TableRow>
                ))}

                {payments.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No tienes pagos registrados.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
}