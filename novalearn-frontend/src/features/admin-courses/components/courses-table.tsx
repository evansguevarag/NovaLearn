"use client";

import Link from "next/link";
import {
    BookOpen,
    CalendarDays,
    ExternalLink,
    ImageOff,
    } from "lucide-react";

    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Skeleton } from "@/components/ui/skeleton";
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table";

    import type {
    AdminCourse,
    CourseStatus,
    } from "@/features/admin-courses/types/admin-course.types";

    interface CoursesTableProps {
    courses: AdminCourse[];
    isLoading: boolean;
    }

    export function CoursesTable({
    courses,
    isLoading,
    }: CoursesTableProps) {
    if (isLoading) {
        return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
            ))}
        </div>
        );
    }

    return (
        <Table className="table-fixed">
        <TableHeader>
            <TableRow>
            <TableHead className="w-[36%] whitespace-normal">
                Curso
            </TableHead>

            <TableHead className="w-[18%] whitespace-normal">
                Instructor
            </TableHead>

            <TableHead className="w-[13%] whitespace-normal">
                Estado
            </TableHead>

            <TableHead className="w-[12%] whitespace-normal">
                Tipo
            </TableHead>

            <TableHead className="w-[11%] whitespace-normal text-right">
                Precio
            </TableHead>

            <TableHead className="w-[10%] whitespace-normal text-right">
                Acción
            </TableHead>
            </TableRow>
        </TableHeader>

        <TableBody>
            {courses.map((course) => (
            <TableRow key={course.id}>
                <TableCell className="whitespace-normal align-top">
                <div className="flex min-w-0 gap-3">
                    <div className="hidden h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted sm:flex">
                    {course.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    </div>

                    <div className="min-w-0">
                    <p className="wrap-break-word font-medium leading-5">
                        {course.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {course.categoryName} ·{" "}
                        {translateLevel(course.level)}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(course.createdAt)}
                    </div>
                    </div>
                </div>
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                <p
                    className="break-all text-sm"
                    title={course.instructorEmail}
                >
                    {course.instructorEmail}
                </p>
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                <CourseStatusBadge status={course.status} />
                </TableCell>

                <TableCell className="whitespace-normal align-top">
                <Badge variant="outline">
                    {course.courseType === "FREE"
                    ? "Gratuito"
                    : "De pago"}
                </Badge>
                </TableCell>

                <TableCell className="whitespace-normal text-right align-top font-medium">
                {formatCurrency(course.price)}
                </TableCell>

                <TableCell className="whitespace-normal text-right align-top">
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/courses/${course.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver
                    </Link>
                </Button>
                </TableCell>
            </TableRow>
            ))}

            {courses.length === 0 && (
            <TableRow>
                <TableCell
                colSpan={6}
                className="whitespace-normal py-12 text-center"
                >
                <div className="flex flex-col items-center">
                    <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />

                    <p className="font-medium">
                    No se encontraron cursos
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                    Ajusta los filtros o registra un nuevo curso.
                    </p>
                </div>
                </TableCell>
            </TableRow>
            )}
        </TableBody>
        </Table>
    );
    }

    function CourseStatusBadge({
    status,
    }: {
    status: CourseStatus;
    }) {
    const labels: Record<CourseStatus, string> = {
        DRAFT: "Borrador",
        PUBLISHED: "Publicado",
        ARCHIVED: "Archivado",
    };

    return (
        <Badge
        variant={
            status === "PUBLISHED" ? "default" : "secondary"
        }
        className="whitespace-nowrap"
        >
        {labels[status]}
        </Badge>
    );
    }

    function translateLevel(level: string): string {
    const levels: Record<string, string> = {
        BEGINNER: "Principiante",
        BASIC: "Básico",
        BASICO: "Básico",
        INTERMEDIATE: "Intermedio",
        INTERMEDIO: "Intermedio",
        ADVANCED: "Avanzado",
        AVANZADO: "Avanzado",
    };

    return levels[level.toUpperCase()] ?? level;
    }

    function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(value);
    }

    function formatDate(value: string): string {
    return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
    }).format(new Date(value));
}