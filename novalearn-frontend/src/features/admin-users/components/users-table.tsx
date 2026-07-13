"use client";

import { Eye, Loader2, Shield } from "lucide-react";
import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
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
    AdminUser,
    AdminUserRole,
    AdminUserStatus,
    } from "@/features/admin-users/types/admin-user.types";

    interface UsersTableProps {
    users: AdminUser[];
    isLoading: boolean;
    updatingUserId: number | null;
    onView: (userId: number) => void;
    onRoleChange: (
        userId: number,
        role: AdminUserRole
    ) => Promise<void>;
    onStatusChange: (
        userId: number,
        status: AdminUserStatus
    ) => Promise<void>;
    }

    type PendingChange =
    | {
        type: "ROLE";
        userId: number;
        value: AdminUserRole;
        }
    | {
        type: "STATUS";
        userId: number;
        value: AdminUserStatus;
        }
    | null;

    export function UsersTable({
    users,
    isLoading,
    updatingUserId,
    onView,
    onRoleChange,
    onStatusChange,
    }: UsersTableProps) {
    const [pendingChange, setPendingChange] =
        useState<PendingChange>(null);

    async function confirmChange() {
        if (!pendingChange) return;

        if (pendingChange.type === "ROLE") {
        await onRoleChange(
            pendingChange.userId,
            pendingChange.value
        );
        } else {
        await onStatusChange(
            pendingChange.userId,
            pendingChange.value
        );
        }

        setPendingChange(null);
    }

    if (isLoading) {
        return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
            ))}
        </div>
        );
    }

    return (
        <>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Verificación</TableHead>
                <TableHead className="text-right">
                    Acciones
                </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {users.map((user) => {
                const isUpdating = updatingUserId === user.id;

                return (
                    <TableRow key={user.id}>
                    <TableCell>
                        <p className="font-medium">
                        {buildUserFullName(user)}
                        </p>

                        <p className="text-xs text-muted-foreground">
                        {user.email}
                        </p>
                    </TableCell>

                    <TableCell>
                        <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />

                        <select
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            value={user.role}
                            disabled={isUpdating}
                            onChange={(event) =>
                            setPendingChange({
                                type: "ROLE",
                                userId: user.id,
                                value: event.target
                                .value as AdminUserRole,
                            })
                            }
                        >
                            <option value="STUDENT">Estudiante</option>
                            <option value="INSTRUCTOR">
                            Instructor
                            </option>
                            <option value="ADMIN">
                            Administrador
                            </option>
                        </select>
                        </div>
                    </TableCell>

                    <TableCell>
                        <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={user.status}
                        disabled={isUpdating}
                        onChange={(event) =>
                            setPendingChange({
                            type: "STATUS",
                            userId: user.id,
                            value: event.target
                                .value as AdminUserStatus,
                            })
                        }
                        >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        </select>
                    </TableCell>

                    <TableCell>
                        {user.emailVerified ? (
                        <Badge>Verificado</Badge>
                        ) : (
                        <Badge variant="secondary">
                            Pendiente
                        </Badge>
                        )}
                    </TableCell>

                    <TableCell className="text-right">
                        <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onView(user.id)}
                        >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Eye className="mr-2 h-4 w-4" />
                        )}

                        Ver
                        </Button>
                    </TableCell>
                    </TableRow>
                );
                })}

                {users.length === 0 && (
                <TableRow>
                    <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                    >
                    No se encontraron usuarios.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        <AlertDialog
            open={pendingChange !== null}
            onOpenChange={(open) => {
            if (!open) setPendingChange(null);
            }}
        >
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                Confirmar modificación
                </AlertDialogTitle>

                <AlertDialogDescription>
                {pendingChange?.type === "ROLE"
                    ? "¿Confirmas que deseas cambiar el rol de este usuario?"
                    : "¿Confirmas que deseas cambiar el estado de este usuario?"}
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>

                <AlertDialogAction onClick={() => void confirmChange()}>
                Confirmar
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

function buildUserFullName(user: AdminUser): string {
    return [
        user.firstName,
        user.paternalLastName || user.lastName,
        user.maternalLastName,
    ]
        .filter(Boolean)
        .join(" ");
}
