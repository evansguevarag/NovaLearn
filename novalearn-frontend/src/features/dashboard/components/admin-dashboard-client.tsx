"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function AdminDashboardClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Dashboard Administrador"
        description="Panel principal del administrador de NovaLearn."
        >
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader>
                <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">---</p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Cursos</CardTitle>
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