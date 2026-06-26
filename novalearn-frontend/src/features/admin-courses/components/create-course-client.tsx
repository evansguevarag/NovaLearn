"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
    Alert,
    AlertDescription,
    AlertTitle,
    } from "@/components/ui/alert";
    import { Button } from "@/components/ui/button";

    import { useAuthGuard } from "@/hooks/use-auth-guard";
    import { getApiErrorMessage } from "@/lib/get-api-error-message";

    import { CourseForm } from "@/features/admin-courses/components/course-form";
    import {
    createAdminCourse,
    getCourseCategories,
    } from "@/features/admin-courses/services/admin-course.service";

    import type {
    AdminCourseRequest,
    CourseCategory,
    } from "@/features/admin-courses/types/admin-course.types";

    export function CreateCourseClient() {
    const router = useRouter();
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isChecking) return;

        let isCancelled = false;

        const timeoutId = window.setTimeout(() => {
        async function loadCategories() {
            try {
            const data = await getCourseCategories();

            if (!isCancelled) {
                setCategories(data);
            }
            } catch (error) {
            if (!isCancelled) {
                setError(
                getApiErrorMessage(
                    error,
                    "No se pudieron cargar las categorías."
                )
                );
            }
            } finally {
            if (!isCancelled) {
                setIsLoading(false);
            }
            }
        }

        void loadCategories();
        }, 0);

        return () => {
        isCancelled = true;
        window.clearTimeout(timeoutId);
        };
    }, [isChecking]);

    async function handleCreate(
        request: AdminCourseRequest
    ): Promise<void> {
        try {
        setIsSubmitting(true);
        setError(null);

        const createdCourse = await createAdminCourse(request);

        router.push(`/admin/courses/${createdCourse.id}`);
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo crear el curso."
            )
        );
        } finally {
        setIsSubmitting(false);
        }
    }

    if (isChecking || isLoading) {
        return (
        <main className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">
            Cargando formulario...
        </main>
        );
    }

    return (
        <DashboardShell
        title="Crear nuevo curso"
        description="Registra la información académica y comercial del curso."
        actions={
            <Button asChild variant="outline">
            <Link href="/admin/courses">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a cursos
            </Link>
            </Button>
        }
        >
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Los campos marcados son obligatorios
            </p>
            </div>

            {error && (
            <Alert variant="destructive">
                <AlertTitle>No se pudo completar la operación</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}

            <CourseForm
            categories={categories}
            isSubmitting={isSubmitting}
            submitLabel="Crear curso"
            onSubmit={handleCreate}
            />
        </div>
        </DashboardShell>
    );
}