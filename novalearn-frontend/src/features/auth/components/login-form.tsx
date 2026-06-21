"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { login } from "@/features/auth/services/auth.service";
import { getDashboardPathByRole } from "@/features/auth/services/redirect-by-role";
import {
    loginSchema,
    type LoginFormValues,
    } from "@/features/auth/types/auth.schema";
    import { saveAuthSession } from "@/lib/auth-storage";

    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Button } from "@/components/ui/button";
    import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card";
    import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    } from "@/components/ui/field";
    import { Input } from "@/components/ui/input";

    export function LoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
        email: "",
        password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setServerError(null);

        try {
        const auth = await login(values);

        saveAuthSession(auth);
        router.push(getDashboardPathByRole(auth.role));
        } catch (error) {
        setServerError(
            getApiErrorMessage(
            error,
            "Correo o contraseña incorrectos. Verifica tus datos."
            )
        );
        }
    }

    return (
        <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>
            Ingresa con tu cuenta para continuar en NovaLearn.
            </CardDescription>
            <CardAction className="text-sm text-muted-foreground">LMS</CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
            {serverError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de acceso</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
            </Alert>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                control={control}
                name="email"
                render={({ field }) => (
                    <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@novalearn.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        {...field}
                    />
                    <FieldError errors={[errors.email]} />
                    </Field>
                )}
                />

                <Controller
                control={control}
                name="password"
                render={({ field }) => (
                    <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        {...field}
                    />
                    <FieldError errors={[errors.password]} />
                    </Field>
                )}
                />
            </FieldGroup>

            <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingresar
            </Button>
            </form>
        </CardContent>
        </Card>
    );
}