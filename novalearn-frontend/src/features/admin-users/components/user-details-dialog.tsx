"use client";

import { CalendarDays, Mail, Shield, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    } from "@/components/ui/dialog";
    import { Skeleton } from "@/components/ui/skeleton";

    import type { AdminUser } from "@/features/admin-users/types/admin-user.types";

    interface UserDetailsDialogProps {
    open: boolean;
    user: AdminUser | null;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
    }

    export function UserDetailsDialog({
    open,
    user,
    isLoading,
    onOpenChange,
    }: UserDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
            <DialogTitle>Detalle del usuario</DialogTitle>

            <DialogDescription>
                Información registrada en NovaLearn.
            </DialogDescription>
            </DialogHeader>

            {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            )}

            {!isLoading && user && (
            <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    ID de usuario: {user.id}
                </p>
                </div>

                <DetailRow
                icon={Mail}
                label="Correo"
                value={user.email}
                />

                <DetailRow
                icon={Shield}
                label="Rol"
                value={user.role}
                />

                <DetailRow
                icon={UserRound}
                label="Estado"
                value={user.status}
                />

                <DetailRow
                icon={CalendarDays}
                label="Fecha de registro"
                value={new Date(user.createdAt).toLocaleString("es-PE")}
                />

                <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{user.role}</Badge>

                <Badge
                    variant={
                    user.status === "ACTIVE" ? "default" : "secondary"
                    }
                >
                    {user.status}
                </Badge>

                <Badge
                    variant={
                    user.emailVerified ? "default" : "secondary"
                    }
                >
                    {user.emailVerified
                    ? "Correo verificado"
                    : "Correo pendiente"}
                </Badge>
                </div>
            </div>
            )}
        </DialogContent>
        </Dialog>
    );
    }

    interface DetailRowProps {
    icon: React.ElementType;
    label: string;
    value: string;
    }

    function DetailRow({
    icon: Icon,
    label,
    value,
    }: DetailRowProps) {
    return (
        <div className="flex items-start gap-3 rounded-lg border p-3">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />

        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
            </p>

            <p className="mt-1 text-sm">{value}</p>
        </div>
        </div>
    );
}