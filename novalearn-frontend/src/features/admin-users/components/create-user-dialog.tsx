"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Loader2,
    Plus,
    SearchCheck,
    XCircle,
    } from "lucide-react";

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
    import { checkAdminUserEmailAvailability } from "@/features/admin-users/services/admin-user.service";
    import { PasswordInput } from "@/features/auth/components/password-input";

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
    paternalLastName: "",
    maternalLastName: "",
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
    const [isCheckingEmail, setIsCheckingEmail] =
        useState(false);
    const [emailAvailability, setEmailAvailability] =
        useState<"AVAILABLE" | "UNAVAILABLE" | "UNKNOWN">(
        "UNKNOWN"
        );

    const normalizedEmail = form.email.trim().toLowerCase();
    const canSubmit =
        !isCreating &&
        !isCheckingEmail &&
        emailAvailability !== "UNAVAILABLE";

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (emailAvailability === "UNAVAILABLE") {
        return;
        }

        const created = await onCreate({
        ...form,
        firstName: form.firstName.trim(),
        paternalLastName: form.paternalLastName.trim(),
        maternalLastName: form.maternalLastName.trim(),
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
        setEmailAvailability("UNKNOWN");
        }
    }

    async function handleCheckEmail() {
        if (!normalizedEmail) {
        setEmailAvailability("UNKNOWN");
        return;
        }

        try {
        setIsCheckingEmail(true);

        const result =
            await checkAdminUserEmailAvailability(normalizedEmail);

        setEmailAvailability(
            result.available ? "AVAILABLE" : "UNAVAILABLE"
        );
        } catch {
        setEmailAvailability("UNKNOWN");
        } finally {
        setIsCheckingEmail(false);
        }
    }

    function handleEmailChange(value: string) {
        setForm({
        ...form,
        email: value,
        });
        setEmailAvailability("UNKNOWN");
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
                <Field>
                    <FieldLabel htmlFor="create-first-name">
                    Nombres completos
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

                <div className="grid gap-4 sm:grid-cols-2">

                <Field>
                    <FieldLabel htmlFor="create-paternal-last-name">
                    Apellido paterno
                    </FieldLabel>

                    <Input
                    id="create-paternal-last-name"
                    value={form.paternalLastName}
                    onChange={(event) =>
                        setForm({
                        ...form,
                        paternalLastName: event.target.value,
                        })
                    }
                    required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="create-maternal-last-name">
                    Apellido materno
                    </FieldLabel>

                    <Input
                    id="create-maternal-last-name"
                    value={form.maternalLastName}
                    onChange={(event) =>
                        setForm({
                        ...form,
                        maternalLastName: event.target.value,
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

                <div className="flex gap-2">
                <Input
                    id="create-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                    handleEmailChange(event.target.value)
                    }
                    onBlur={() => void handleCheckEmail()}
                    required
                />
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={isCheckingEmail || !normalizedEmail}
                    onClick={() => void handleCheckEmail()}
                >
                    {isCheckingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <SearchCheck className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                    Verificar correo
                    </span>
                </Button>
                </div>

                {emailAvailability === "AVAILABLE" && (
                <p className="flex items-center gap-1 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Correo disponible.
                </p>
                )}

                {emailAvailability === "UNAVAILABLE" && (
                <p className="flex items-center gap-1 text-xs text-amber-700">
                    <XCircle className="h-3.5 w-3.5" />
                    Este correo ya está en uso.
                </p>
                )}
                </Field>

                <Field>
                <FieldLabel htmlFor="create-password">
                    Contraseña
                </FieldLabel>

                <PasswordInput
                    id="create-password"
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

                <Button type="submit" disabled={!canSubmit}>
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
