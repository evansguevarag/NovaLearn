import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type {
    AdminUserRole,
    AdminUserStatus,
    } from "@/features/admin-users/types/admin-user.types";

    interface UserFiltersProps {
    search: string;
    role: AdminUserRole | "ALL";
    status: AdminUserStatus | "ALL";
    onSearchChange: (value: string) => void;
    onRoleChange: (value: AdminUserRole | "ALL") => void;
    onStatusChange: (value: AdminUserStatus | "ALL") => void;
    }

    export function UserFilters({
    search,
    role,
    status,
    onSearchChange,
    onRoleChange,
    onStatusChange,
    }: UserFiltersProps) {
    return (
        <div className="grid gap-3 md:grid-cols-[1fr_190px_220px]">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, apellido o correo..."
            className="pl-9"
            />
        </div>

        <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={role}
            onChange={(event) =>
            onRoleChange(event.target.value as AdminUserRole | "ALL")
            }
        >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Estudiante</option>
        </select>

        <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(event) =>
            onStatusChange(event.target.value as AdminUserStatus | "ALL")
            }
        >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="PENDING_VERIFICATION">
            Verificación pendiente
            </option>
        </select>
        </div>
    );
}