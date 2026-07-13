"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { PasswordInput } from "@/features/auth/components/password-input";
import {
  checkEmailAvailability,
  register,
} from "@/features/auth/services/auth.service";
import { getDashboardPathByRole } from "@/features/auth/services/redirect-by-role";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/types/auth.schema";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { saveAuthSession } from "@/lib/auth-storage";

function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(
    null
  );
  const [isCheckingEmail, setIsCheckingEmail] =
    useState(false);
  const [emailAvailability, setEmailAvailability] =
    useState<"AVAILABLE" | "UNAVAILABLE" | "UNKNOWN">(
      "UNKNOWN"
    );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailCheckRequestRef = useRef(0);
  const watchedEmail = useWatch({
    control,
    name: "email",
  });
  const currentEmail = watchedEmail.trim().toLowerCase();
  const canSubmit =
    !isSubmitting &&
    !isCheckingEmail &&
    emailAvailability !== "UNAVAILABLE";

  useEffect(() => {
    const requestId = emailCheckRequestRef.current + 1;
    emailCheckRequestRef.current = requestId;

    if (!isValidEmailFormat(currentEmail)) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsCheckingEmail(true);

        const result =
          await checkEmailAvailability(currentEmail);

        if (emailCheckRequestRef.current !== requestId) {
          return;
        }

        setEmailAvailability(
          result.available ? "AVAILABLE" : "UNAVAILABLE"
        );
      } catch {
        if (emailCheckRequestRef.current === requestId) {
          setEmailAvailability("UNKNOWN");
        }
      } finally {
        if (emailCheckRequestRef.current === requestId) {
          setIsCheckingEmail(false);
        }
      }
    }, 650);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentEmail]);

  async function onSubmit(values: RegisterFormValues) {
    if (emailAvailability === "UNAVAILABLE") {
      return;
    }

    setServerError(null);

    try {
      toast.loading("Creando cuenta...", {
        id: "register",
        description: "Estamos registrando tu acceso como estudiante.",
      });

      const auth = await register({
        firstName: values.firstName.trim(),
        paternalLastName: values.paternalLastName.trim(),
        maternalLastName: values.maternalLastName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      saveAuthSession(auth);
      toast.success("Cuenta creada.", {
        id: "register",
        description: "Bienvenido a NovaLearn.",
      });
      router.push(getDashboardPathByRole(auth.role));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo crear la cuenta. Revisa tus datos."
      );

      setServerError(message);
      toast.error("Registro no completado.", {
        id: "register",
        description: message,
      });
    }
  }

  function handleEmailChange(
    value: string,
    onChange: (value: string) => void
  ) {
    onChange(value);
    setIsCheckingEmail(false);
    setEmailAvailability("UNKNOWN");
  }

  const disabledClassName = isSubmitting
    ? "pointer-events-none opacity-70"
    : "";

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-border/70 shadow-xl">
      {isSubmitting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin" />
            <div>
              <p className="text-sm font-medium">
                Creando cuenta
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tu perfil se registrará como estudiante.
              </p>
            </div>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate como estudiante para acceder al catálogo.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registro no completado</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor="register-first-name">
                    Nombres completos
                  </FieldLabel>
                  <Input
                    id="register-first-name"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    className={disabledClassName}
                    {...field}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="paternalLastName"
                render={({ field }) => (
                  <Field data-invalid={!!errors.paternalLastName}>
                    <FieldLabel htmlFor="register-paternal-last-name">
                      Apellido paterno
                    </FieldLabel>
                    <Input
                      id="register-paternal-last-name"
                      autoComplete="family-name"
                      disabled={isSubmitting}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[errors.paternalLastName]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="maternalLastName"
                render={({ field }) => (
                  <Field data-invalid={!!errors.maternalLastName}>
                    <FieldLabel htmlFor="register-maternal-last-name">
                      Apellido materno
                    </FieldLabel>
                    <Input
                      id="register-maternal-last-name"
                      disabled={isSubmitting}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[errors.maternalLastName]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="register-email">
                    Correo electrónico
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className={disabledClassName}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onChange={(event) =>
                        handleEmailChange(
                          event.target.value,
                          field.onChange
                        )
                      }
                      onBlur={field.onBlur}
                    />
                    {isCheckingEmail && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
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
                  <FieldError errors={[errors.email]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="register-password">
                    Contraseña
                  </FieldLabel>
                  <PasswordInput
                    id="register-password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className={disabledClassName}
                    {...field}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="register-confirm-password">
                    Confirmar contraseña
                  </FieldLabel>
                  <PasswordInput
                    id="register-confirm-password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className={disabledClassName}
                    {...field}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            className="w-full"
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Creando cuenta" : "Registrarme"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-medium text-foreground underline" href="/login">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
