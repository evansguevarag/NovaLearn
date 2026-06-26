import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type {
    CourseCategory,
    CourseStatus,
    CourseType,
    } from "@/features/admin-courses/types/admin-course.types";

    interface CourseFiltersProps {
    search: string;
    status: CourseStatus | "ALL";
    courseType: CourseType | "ALL";
    categoryId: number | "ALL";
    categories: CourseCategory[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: CourseStatus | "ALL") => void;
    onCourseTypeChange: (value: CourseType | "ALL") => void;
    onCategoryChange: (value: number | "ALL") => void;
    }

    export function CourseFilters({
    search,
    status,
    courseType,
    categoryId,
    categories,
    onSearchChange,
    onStatusChange,
    onCourseTypeChange,
    onCategoryChange,
    }: CourseFiltersProps) {
    return (
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_170px_190px]">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
            value={search}
            onChange={(event) =>
                onSearchChange(event.target.value)
            }
            placeholder="Buscar por título, instructor o categoría..."
            className="pl-9"
            />
        </div>

        <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(event) =>
            onStatusChange(
                event.target.value as CourseStatus | "ALL"
            )
            }
        >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
        </select>

        <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={courseType}
            onChange={(event) =>
            onCourseTypeChange(
                event.target.value as CourseType | "ALL"
            )
            }
        >
            <option value="ALL">Todos los tipos</option>
            <option value="FREE">Gratuito</option>
            <option value="PAID">De pago</option>
        </select>

        <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={categoryId}
            onChange={(event) => {
            const value = event.target.value;

            onCategoryChange(
                value === "ALL" ? "ALL" : Number(value)
            );
            }}
        >
            <option value="ALL">Todas las categorías</option>

            {categories.map((category) => (
            <option key={category.id} value={category.id}>
                {category.name}
            </option>
            ))}
        </select>
        </div>
    );
}