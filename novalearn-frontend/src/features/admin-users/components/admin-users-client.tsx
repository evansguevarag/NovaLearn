"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserCog } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { CreateUserDialog } from "@/features/admin-users/components/create-user-dialog";
import { UserDetailsDialog } from "@/features/admin-users/components/user-details-dialog";
import { UserFilters } from "@/features/admin-users/components/user-filters";
import { UsersTable } from "@/features/admin-users/components/users-table";

import {
    createAdminUser,
    getAdminUserById,
    getAdminUsers,
    updateAdminUserRole,
    updateAdminUserStatus,
    } from "@/features/admin-users/services/admin-user.service";

    import type {
    AdminCreateUserRequest,
    AdminUser,
    AdminUserRole,
    AdminUserStatus,
    } from "@/features/admin-users/types/admin-user.types";

    export function AdminUsersClient() {
    const { isChecking } = useAuthGuard(["ADMIN"]);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [selectedUser, setSelectedUser] =
        useState<AdminUser | null>(null);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] =
        useState<AdminUserRole | "ALL">("ALL");
    const [statusFilter, setStatusFilter] =
        useState<AdminUserStatus | "ALL">("ALL");

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] =
        useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updatingUserId, setUpdatingUserId] =
        useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] =
        useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        try {
        setIsLoading(true);
        setError(null);

        const data = await getAdminUsers();
        setUsers(data);
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo cargar la lista de usuarios."
            )
        );
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isChecking) return;

        const timeoutId = window.setTimeout(() => {
        void loadUsers();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isChecking, loadUsers]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return users.filter((user) => {
        const fullName =
            `${user.firstName} ${user.lastName}`.toLowerCase();

        const matchesSearch =
            normalizedSearch.length === 0 ||
            fullName.includes(normalizedSearch) ||
            user.email.toLowerCase().includes(normalizedSearch);

        const matchesRole =
            roleFilter === "ALL" || user.role === roleFilter;

        const matchesStatus =
            statusFilter === "ALL" ||
            user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    async function handleCreateUser(
        request: AdminCreateUserRequest
    ): Promise<boolean> {
        try {
        setIsCreating(true);
        setError(null);
        setSuccessMessage(null);

        await createAdminUser(request);
        await loadUsers();

        setSuccessMessage("Usuario creado correctamente.");
        return true;
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo crear el usuario."
            )
        );

        return false;
        } finally {
        setIsCreating(false);
        }
    }

    async function handleViewUser(userId: number) {
        try {
        setDetailsOpen(true);
        setIsLoadingDetails(true);
        setSelectedUser(null);
        setError(null);

        const user = await getAdminUserById(userId);
        setSelectedUser(user);
        } catch (error) {
        setDetailsOpen(false);

        setError(
            getApiErrorMessage(
            error,
            "No se pudo consultar el usuario."
            )
        );
        } finally {
        setIsLoadingDetails(false);
        }
    }

    async function handleRoleChange(
        userId: number,
        role: AdminUserRole
    ) {
        try {
        setUpdatingUserId(userId);
        setError(null);
        setSuccessMessage(null);

        const updatedUser = await updateAdminUserRole(userId, {
            role,
        });

        setUsers((currentUsers) =>
            currentUsers.map((user) =>
            user.id === userId ? updatedUser : user
            )
        );

        setSuccessMessage("Rol actualizado correctamente.");
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo actualizar el rol."
            )
        );
        } finally {
        setUpdatingUserId(null);
        }
    }

    async function handleStatusChange(
        userId: number,
        status: AdminUserStatus
    ) {
        try {
        setUpdatingUserId(userId);
        setError(null);
        setSuccessMessage(null);

        const updatedUser = await updateAdminUserStatus(userId, {
            status,
        });

        setUsers((currentUsers) =>
            currentUsers.map((user) =>
            user.id === userId ? updatedUser : user
            )
        );

        setSuccessMessage("Estado actualizado correctamente.");
        } catch (error) {
        setError(
            getApiErrorMessage(
            error,
            "No se pudo actualizar el estado."
            )
        );
        } finally {
        setUpdatingUserId(null);
        }
    }

    if (isChecking) {
        return <main className="p-8">Validando sesión...</main>;
    }

    return (
        <DashboardShell
        title="Gestión de usuarios"
        description="Administra estudiantes, instructores y administradores."
        >
        <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm text-muted-foreground">
                {filteredUsers.length} de {users.length} usuarios
                </p>
            </div>

            <CreateUserDialog
                isCreating={isCreating}
                onCreate={handleCreateUser}
            />
            </div>

            {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}

            {successMessage && (
            <Alert>
                <AlertTitle>Operación completada</AlertTitle>
                <AlertDescription>
                {successMessage}
                </AlertDescription>
            </Alert>
            )}

            <Card>
            <CardHeader className="space-y-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                <UserCog className="h-5 w-5" />
                Usuarios registrados
                </CardTitle>

                <UserFilters
                search={search}
                role={roleFilter}
                status={statusFilter}
                onSearchChange={setSearch}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
                />
            </CardHeader>

            <CardContent>
                <UsersTable
                users={filteredUsers}
                isLoading={isLoading}
                updatingUserId={updatingUserId}
                onView={handleViewUser}
                onRoleChange={handleRoleChange}
                onStatusChange={handleStatusChange}
                />
            </CardContent>
            </Card>
        </div>

        <UserDetailsDialog
            open={detailsOpen}
            user={selectedUser}
            isLoading={isLoadingDetails}
            onOpenChange={setDetailsOpen}
        />
        </DashboardShell>
    );
}