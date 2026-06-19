"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function StudentDashboardClient() {
    const { isChecking } = useAuthGuard(["STUDENT"]);

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Dashboard Estudiante"
        description="Resumen de tus cursos, progreso y certificados."
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
                <CardTitle>Progreso</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Certificados</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>
        </div>
        </DashboardShell>
    );
}