"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    } from "@/components/ui/dialog";
    import {
    Field,
    FieldGroup,
    FieldLabel,
    } from "@/components/ui/field";
    import { Input } from "@/components/ui/input";

    import type {
    AdminCreateUserRequest,
    AdminUserRole,
    } from "@/features/admin-users/types/admin-user.types";

    interface CreateUserDialogProps {
    isCreating: boolean;
    onCreate: (request: AdminCreateUserRequest) => Promise<boolean>;
    }

    const INITIAL_FORM: AdminCreateUserRequest = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "INSTRUCTOR",
    };

    export function CreateUserDialog({
    isCreating,
    onCreate,
    }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] =
        useState<AdminCreateUserRequest>(INITIAL_FORM);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const created = await onCreate({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        });

        if (created) {
        setForm(INITIAL_FORM);
        setOpen(false);
        }
    }

    function handleOpenChange(nextOpen: boolean) {
        if (isCreating) return;

        setOpen(nextOpen);

        if (!nextOpen) {
        setForm(INITIAL_FORM);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
            <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear usuario
            </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>

            <DialogDescription>
                Registra un estudiante, instructor o administrador.
            </DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
            <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="create-first-name">
                    Nombre
                    </FieldLabel>

                    <Input
                    id="create-first-name"
                    value={form.firstName}
                    onChange={(event) =>
                        setForm({
                        ...form,
                        firstName: event.target.value,
                        })
                    }
                    required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="create-last-name">
                    Apellido
                    </FieldLabel>

                    <Input
                    id="create-last-name"
                    value={form.lastName}
                    onChange={(event) =>
                        setForm({
                        ...form,
                        lastName: event.target.value,
                        })
                    }
                    required
                    />
                </Field>
                </div>

                <Field>
                <FieldLabel htmlFor="create-email">
                    Correo electrónico
                </FieldLabel>

                <Input
                    id="create-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                    setForm({
                        ...form,
                        email: event.target.value,
                    })
                    }
                    required
                />
                </Field>

                <Field>
                <FieldLabel htmlFor="create-password">
                    Contraseña
                </FieldLabel>

                <Input
                    id="create-password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                    setForm({
                        ...form,
                        password: event.target.value,
                    })
                    }
                    minLength={8}
                    required
                />
                </Field>

                <Field>
                <FieldLabel htmlFor="create-role">Rol</FieldLabel>

                <select
                    id="create-role"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.role}
                    onChange={(event) =>
                    setForm({
                        ...form,
                        role: event.target.value as AdminUserRole,
                    })
                    }
                >
                    <option value="STUDENT">Estudiante</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Administrador</option>
                </select>
                </Field>
            </FieldGroup>

            <DialogFooter>
                <Button
                type="button"
                variant="outline"
                disabled={isCreating}
                onClick={() => handleOpenChange(false)}
                >
                Cancelar
                </Button>

                <Button type="submit" disabled={isCreating}>
                {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Registrar usuario
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    );
}