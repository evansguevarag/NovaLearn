"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/features/auth/components/otp-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import {
  changeAccountPassword,
  confirmAccountEmailChange,
  getAccountProfile,
  requestAccountEmailChange,
} from "@/features/account/services/account.service";
import type {
  AccountProfile,
  EmailChangeChallenge,
} from "@/features/account/types/account.types";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { saveAuthSession } from "@/lib/auth-storage";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const emailSchema = z.object({
  email: z.string().trim().min(1, "Ingresa tu correo electrónico.").email(
    "Ingresa un correo válido."
  ),
});

const emailOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Ingresa el código de 6 dígitos."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
    newPassword: z.string().min(8, "La nueva contraseña debe tener mínimo 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type EmailOtpFormValues = z.infer<typeof emailOtpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  INSTRUCTOR: "Instructor",
  STUDENT: "Estudiante",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export function AccountClient() {
  useAuthGuard(["ADMIN", "INSTRUCTOR", "STUDENT"]);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const [isConfirmingEmailChange, setIsConfirmingEmailChange] = useState(false);
  const [emailChallenge, setEmailChallenge] =
    useState<EmailChangeChallenge | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailOtpForm = useForm<EmailOtpFormValues>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: {
      code: "",
    },
  });

  const emailOtpCode = useWatch({
    control: emailOtpForm.control,
    name: "code",
  });

  const fullName = useMemo(() => {
    if (!profile) {
      return "Mi cuenta";
    }

    return [
      profile.firstName,
      profile.paternalLastName,
      profile.maternalLastName,
    ]
      .filter(Boolean)
      .join(" ");
  }, [profile]);

  const initials = [
    profile?.firstName,
    profile?.paternalLastName,
  ]
    .map((part) => part?.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase();

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await getAccountProfile();

        if (!isMounted) {
          return;
        }

        setProfile(data);
        emailForm.reset({
          email: data.email,
        });
      } catch (error) {
        toast.error("No se pudo cargar tu cuenta.", {
          description: getApiErrorMessage(error),
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [emailForm]);

  async function handleUpdateEmail(values: EmailFormValues) {
    if (!profile) {
      return;
    }

    if (isRequestingEmailChange || isConfirmingEmailChange) {
      return;
    }

    emailForm.clearErrors("email");
    setIsRequestingEmailChange(true);

    try {
      const challenge = await requestAccountEmailChange({
        email: values.email,
      });

      setEmailChallenge(challenge);
      emailOtpForm.reset({ code: "" });
      toast.success("Código enviado.", {
        description: `Revisa ${challenge.maskedEmail} para confirmar el cambio.`,
      });
    } catch (error) {
      emailForm.setError("email", {
        type: "server",
        message: getApiErrorMessage(
          error,
          "No se pudo validar el correo. Inténtalo nuevamente."
        ),
      });
    } finally {
      setIsRequestingEmailChange(false);
    }
  }

  async function handleConfirmEmailChange(values: EmailOtpFormValues) {
    if (!emailChallenge) {
      return;
    }

    setIsConfirmingEmailChange(true);

    try {
      const response = await confirmAccountEmailChange({
        challengeId: emailChallenge.challengeId,
        code: values.code,
      });

      setProfile(response.profile);
      saveAuthSession(response.auth);
      emailForm.reset({ email: response.profile.email });
      emailOtpForm.reset({ code: "" });
      setEmailChallenge(null);
      setIsEmailDialogOpen(false);
      toast.success("Correo actualizado.", {
        description: "Usa este correo en tu próximo inicio de sesión.",
      });
    } catch (error) {
      toast.error("No se pudo confirmar el correo.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsConfirmingEmailChange(false);
    }
  }

  async function handleChangePassword(values: PasswordFormValues) {
    setIsChangingPassword(true);

    try {
      await changeAccountPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      passwordForm.reset();
      toast.success("Contraseña actualizada.", {
        description: "Usa tu nueva contraseña en el próximo inicio de sesión.",
      });
    } catch (error) {
      toast.error("No se pudo cambiar la contraseña.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <DashboardShell
      title="Mi cuenta"
      description="Actualiza tus datos personales y administra tu acceso."
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-5 border-b bg-primary px-6 py-6 text-primary-foreground lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 border border-primary-foreground/20 bg-primary-foreground/10">
                <AvatarFallback className="bg-primary-foreground text-lg font-semibold text-primary">
                  {initials || "NL"}
                </AvatarFallback>
                <AvatarBadge className="size-5 bg-primary-foreground text-primary ring-primary">
                  <span className="text-xs">🎓</span>
                </AvatarBadge>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm text-primary-foreground/70">
                  Perfil de acceso
                </p>
                <h2 className="truncate text-2xl font-semibold">
                  {fullName}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {roleLabels[profile?.role ?? ""] ?? profile?.role ?? "Rol"}
                  </Badge>
                  <Badge variant="secondary">
                    {statusLabels[profile?.status ?? ""] ?? profile?.status ?? "Estado"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-2 text-sm lg:min-w-80">
              <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">
                  {profile?.email ?? "Cargando correo..."}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Información personal</CardTitle>
                  <CardDescription>
                    Estos datos se usan en matrículas, reportes y certificados.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <ReadOnlyField
                    label="Nombres completos"
                    value={profile?.firstName}
                    isLoading={isLoading}
                  />
                  <ReadOnlyField
                    label="Apellido paterno"
                    value={profile?.paternalLastName}
                    isLoading={isLoading}
                  />
                  <ReadOnlyField
                    label="Apellido materno"
                    value={profile?.maternalLastName}
                    isLoading={isLoading}
                  />
                </div>

                <ReadOnlyField
                  label="Correo actual"
                  value={profile?.email}
                  isLoading={isLoading}
                  icon={<Mail className="h-4 w-4" />}
                  description="Se usa para iniciar sesión, recuperar contraseña y recibir notificaciones importantes."
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => {
                        setEmailChallenge(null);
                        emailOtpForm.reset({ code: "" });
                        setIsEmailDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Modificar
                    </Button>
                  }
                />

                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-medium">
                    Corrección de datos académicos
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Si tu nombre o apellidos tienen un error, solicita la corrección a un administrador para mantener consistentes tus certificados y reportes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <KeyRound className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña de acceso cuando lo necesites.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <div className="mb-5 rounded-lg border bg-muted/40 p-4">
                <p className="text-sm font-medium">
                  Recomendación
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usa una contraseña de al menos 8 caracteres y evita reutilizarla en otros servicios.
                </p>
              </div>

              <form
                className="grid gap-4"
                onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              >
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    disabled={isChangingPassword}
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <PasswordInput
                    id="newPassword"
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isChangingPassword
                    ? "Actualizando..."
                    : "Cambiar contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacidad y acceso</CardTitle>
            <CardDescription>
              Tu correo y contraseña nunca se muestran públicamente en NovaLearn.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">Rol activo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {roleLabels[profile?.role ?? ""] ?? profile?.role ?? "Cargando"}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">Estado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {statusLabels[profile?.status ?? ""] ?? profile?.status ?? "Cargando"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isEmailDialogOpen}
        onOpenChange={(open) => {
          setIsEmailDialogOpen(open);

          if (!open) {
            setEmailChallenge(null);
            emailOtpForm.reset({ code: "" });
            emailForm.reset({ email: profile?.email ?? "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar correo electrónico</DialogTitle>
            <DialogDescription>
              Primero enviaremos un código al nuevo correo. El cambio se aplicará solo después de validarlo.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={emailForm.handleSubmit(handleUpdateEmail)}
          >
            <div className="grid gap-2">
              <Label htmlFor="newAccountEmail">Nuevo correo</Label>
              <Input
                id="newAccountEmail"
                type="email"
                autoComplete="email"
                disabled={isRequestingEmailChange || isConfirmingEmailChange}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isRequestingEmailChange || isConfirmingEmailChange}
            >
              <Mail className="h-4 w-4" />
              {isRequestingEmailChange ? "Enviando..." : "Enviar código"}
            </Button>
          </form>

          {emailChallenge && (
            <form
              className="grid gap-4 rounded-lg border bg-muted/30 p-4"
              onSubmit={emailOtpForm.handleSubmit(handleConfirmEmailChange)}
            >
              <div className="grid gap-2">
                <Label>Código OTP</Label>
                <OtpInput
                  idPrefix="email-change-otp"
                  value={emailOtpCode}
                  disabled={isConfirmingEmailChange}
                  onChange={(value) =>
                    emailOtpForm.setValue("code", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  onBlur={() => emailOtpForm.trigger("code")}
                />
                {emailOtpForm.formState.errors.code && (
                  <p className="text-sm text-destructive">
                    {emailOtpForm.formState.errors.code.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Código enviado a {emailChallenge.maskedEmail}. Vence en 10 minutos.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isConfirmingEmailChange}
              >
                <ShieldCheck className="h-4 w-4" />
                {isConfirmingEmailChange ? "Confirmando..." : "Confirmar cambio"}
              </Button>
            </form>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value?: string;
  isLoading: boolean;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function ReadOnlyField({
  label,
  value,
  isLoading,
  description,
  icon,
  action,
}: ReadOnlyFieldProps) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate">
            {isLoading ? "Cargando..." : value || "No registrado"}
          </span>
        </div>
        {action}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
