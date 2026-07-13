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
  completePasswordReset,
  requestPasswordReset,
} from "@/features/auth/services/auth.service";
import {
  passwordResetCompleteSchema,
  type PasswordResetCompleteFormValues,
  passwordResetRequestSchema,
  type PasswordResetRequestFormValues,
} from "@/features/auth/types/auth.schema";
import type { PasswordResetChallenge } from "@/features/auth/types/auth.types";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [challenge, setChallenge] =
    useState<PasswordResetChallenge | null>(null);
  const [genericSent, setGenericSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    control: completeControl,
    handleSubmit: handleCompleteSubmit,
    reset: resetCompleteForm,
    setValue: setCompleteValue,
    formState: {
      errors: completeErrors,
      isSubmitting: isCompleting,
    },
  } = useForm<PasswordResetCompleteFormValues>({
    resolver: zodResolver(passwordResetCompleteSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onRequestSubmit(
    values: PasswordResetRequestFormValues
  ) {
    try {
      toast.loading("Enviando código...", {
        id: "password-reset",
        description: "Estamos procesando tu solicitud.",
      });

      const nextChallenge = await requestPasswordReset({
        email: values.email.trim().toLowerCase(),
      });

      setGenericSent(true);
      resetCompleteForm();

      if (nextChallenge.challengeId) {
        setChallenge(nextChallenge);
        toast.success("Código enviado.", {
          id: "password-reset",
          description: `Revisa el correo ${nextChallenge.email}.`,
        });
        return;
      }

      toast.success("Solicitud recibida.", {
        id: "password-reset",
        description:
          "Si el correo existe, recibirás instrucciones para continuar.",
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No se pudo procesar la solicitud."
      );

      toast.error("No se pudo recuperar la contraseña.", {
        id: "password-reset",
        description: message,
      });
    }
  }

  async function onCompleteSubmit(
    values: PasswordResetCompleteFormValues
  ) {
    if (!challenge) {
      return;
    }

    try {
      toast.loading("Actualizando contraseña...", {
        id: "password-reset",
        description: "Estamos guardando tu nueva contraseña.",
      });

      await completePasswordReset({
        challengeId: challenge.challengeId,
        code: values.code,
        newPassword: values.newPassword,
      });

      toast.success("Contraseña actualizada.", {
        id: "password-reset",
        description: "Ya puedes iniciar sesión.",
      });
      router.push("/login");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "El código no es válido o ya expiró."
      );

      toast.error("No se pudo actualizar la contraseña.", {
        id: "password-reset",
        description: message,
      });
    }
  }

  const isBusy = isSubmitting || isCompleting;
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
                {challenge
                  ? "Actualizando contraseña"
                  : "Enviando código"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Espera un momento.
              </p>
            </div>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">
          Recuperar contraseña
        </CardTitle>
        <CardDescription>
          {challenge
            ? `Ingresa el código enviado a ${challenge.email}.`
            : "Te enviaremos un código para crear una nueva contraseña."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {!challenge ? (
          <form
            className="space-y-5"
            onSubmit={handleSubmit(onRequestSubmit)}
          >
            <FieldGroup>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="reset-email">
                      Correo electrónico
                    </FieldLabel>
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      disabled={isBusy}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>
                )}
              />
            </FieldGroup>

            {genericSent && (
              <p className="text-sm text-muted-foreground">
                Si el correo existe, recibirás instrucciones para continuar.
              </p>
            )}

            <Button
              className="w-full"
              disabled={isBusy}
              type="submit"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Enviando código" : "Enviar código"}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-5"
            onSubmit={handleCompleteSubmit(onCompleteSubmit)}
          >
            <FieldGroup>
              <Controller
                control={completeControl}
                name="code"
                render={({ field }) => (
                  <Field data-invalid={!!completeErrors.code}>
                    <FieldLabel htmlFor="reset-code">
                      Código
                    </FieldLabel>
                    <OtpInput
                      idPrefix="reset-code"
                      disabled={isBusy}
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onChange={(nextCode) =>
                        setCompleteValue("code", nextCode, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <FieldError errors={[completeErrors.code]} />
                  </Field>
                )}
              />

              <Controller
                control={completeControl}
                name="newPassword"
                render={({ field }) => (
                  <Field data-invalid={!!completeErrors.newPassword}>
                    <FieldLabel htmlFor="new-password">
                      Nueva contraseña
                    </FieldLabel>
                    <PasswordInput
                      id="new-password"
                      autoComplete="new-password"
                      disabled={isBusy}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[completeErrors.newPassword]} />
                  </Field>
                )}
              />

              <Controller
                control={completeControl}
                name="confirmPassword"
                render={({ field }) => (
                  <Field data-invalid={!!completeErrors.confirmPassword}>
                    <FieldLabel htmlFor="confirm-new-password">
                      Confirmar contraseña
                    </FieldLabel>
                    <PasswordInput
                      id="confirm-new-password"
                      autoComplete="new-password"
                      disabled={isBusy}
                      className={disabledClassName}
                      {...field}
                    />
                    <FieldError errors={[completeErrors.confirmPassword]} />
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              className="w-full"
              disabled={isBusy}
              type="submit"
            >
              {isCompleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCompleting
                ? "Actualizando contraseña"
                : "Guardar contraseña"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link className="font-medium text-foreground underline" href="/login">
            Volver a iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
