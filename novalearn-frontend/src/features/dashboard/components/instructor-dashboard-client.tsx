"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function InstructorDashboardClient() {
    const { isChecking } = useAuthGuard(["INSTRUCTOR", "ADMIN"]);

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Dashboard Instructor"
        description="Panel para revisar tus cursos y estudiantes."
        >
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader>
                <CardTitle>Mis cursos</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Matrículas</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>
        </div>
        </DashboardShell>
    );
}