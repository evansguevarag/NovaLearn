"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { OtpInput } from "@/features/auth/components/otp-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import {
  login,
  verifyLoginOtp,
} from "@/features/auth/services/auth.service";
import { getDashboardPathByRole } from "@/features/auth/services/redirect-by-role";
import {
  loginOtpSchema,
  type LoginOtpFormValues,
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/types/auth.schema";
import type { LoginOtpChallenge } from "@/features/auth/types/auth.types";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { saveAuthSession } from "@/lib/auth-storage";

interface LoginFormProps {
  onOtpStepChange?: (isOtpStep: boolean) => void;
}

export function LoginForm({
  onOtpStepChange,
}: LoginFormProps) {
  const router = useRouter();
  const [otpChallenge, setOtpChallenge] =
    useState<LoginOtpChallenge | null>(null);

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

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    reset: resetOtpForm,
    setValue: setOtpValue,
    formState: {
      errors: otpErrors,
      isSubmitting: isVerifyingOtp,
    },
  } = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      toast.loading("Validando credenciales...", {
        id: "login",
        description: "Te enviaremos un código de acceso.",
      });

      const result = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (!result.requiresOtp && result.auth) {
        saveAuthSession(result.auth);
        toast.success("Sesión iniciada.", {
          id: "login",
          description: "Te llevaremos a tu panel.",
        });
        router.push(getDashboardPathByRole(result.auth.role));
        return;
      }

      if (!result.challenge) {
        throw new Error("No se pudo iniciar el desafío OTP");
      }

      setOtpChallenge(result.challenge);
      onOtpStepChange?.(true);
      resetOtpForm();
      toast.success("Código enviado.", {
        id: "login",
        description: `Revisa el correo ${result.challenge.email}.`,
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Correo o contraseña incorrectos. Verifica tus datos."
      );

      toast.error("No se pudo iniciar sesión.", {
        id: "login",
        description: message,
      });
    }
  }

  async function onOtpSubmit(values: LoginOtpFormValues) {
    if (!otpChallenge) {
      return;
    }

    try {
      toast.loading("Verificando código...", {
        id: "login",
        description: "Estamos confirmando tu acceso.",
      });

      const auth = await verifyLoginOtp({
        challengeId: otpChallenge.challengeId,
        code: values.code,
      });

      saveAuthSession(auth);
      toast.success("Sesión iniciada.", {
        id: "login",
        description: "Te llevaremos a tu panel.",
      });
      router.push(getDashboardPathByRole(auth.role));
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "El código ingresado no es válido o ya expiró."
      );

      toast.error("No se pudo iniciar sesión.", {
        id: "login",
        description: message,
      });
    }
  }

  function handleChangeCredentials() {
    setOtpChallenge(null);
    onOtpStepChange?.(false);
    resetOtpForm();
  }

  const isBusy = isSubmitting || isVerifyingOtp;
  const disabledClassName = isBusy
    ? "pointer-events-none opacity-70"
    : "";

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-border/70 shadow-xl">
      {isBusy && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin" />
            <div>
              <p className="text-sm font-medium">
                {otpChallenge
                  ? "Verificando código"
                  : "Validando acceso"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {otpChallenge
                  ? "Estamos confirmando tu ingreso."
                  : "Estamos verificando tu cuenta."}
              </p>
            </div>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">
          {otpChallenge ? "Código de acceso" : "Iniciar sesión"}
        </CardTitle>
        <CardDescription>
          {otpChallenge
            ? `Ingresa el código enviado a ${otpChallenge.email}.`
            : "Ingresa con tu cuenta para continuar en NovaLearn."}
        </CardDescription>
        <CardAction className="text-sm text-muted-foreground">
          LMS
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5">
        {!otpChallenge ? (
          <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">
                      Correo electrónico
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@novalearn.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      disabled={isBusy}
                      className={disabledClassName}
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
                    <FieldLabel htmlFor="password">
                      Contraseña
                    </FieldLabel>
                    <PasswordInput
                      id="password"
                      placeholder="********"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      disabled={isBusy}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[errors.password]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="text-right text-sm">
              <Link
                className="font-medium text-foreground underline"
                href="/forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              className="w-full"
              disabled={isBusy}
              type="submit"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Enviando código" : "Continuar"}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-5"
            onSubmit={handleOtpSubmit(onOtpSubmit)}
          >
            <FieldGroup>
              <Controller
                control={otpControl}
                name="code"
                render={({ field }) => (
                  <Field data-invalid={!!otpErrors.code}>
                    <FieldLabel htmlFor="otp-code">
                      Código OTP
                    </FieldLabel>
                    <OtpInput
                      idPrefix="otp-code"
                      disabled={isBusy}
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={(nextCode) =>
                        setOtpValue("code", nextCode, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <FieldError errors={[otpErrors.code]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              className="w-full"
              disabled={isBusy}
              type="submit"
            >
              {isVerifyingOtp && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isVerifyingOtp
                ? "Verificando código"
                : "Ingresar"}
            </Button>

            <Button
              className="w-full"
              disabled={isBusy}
              onClick={handleChangeCredentials}
              type="button"
              variant="outline"
            >
              Cambiar correo o contraseña
            </Button>
          </form>
        )}

        {!otpChallenge && (
          <p className="text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <Link className="font-medium text-foreground underline" href="/register">
              Regístrate como estudiante
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
