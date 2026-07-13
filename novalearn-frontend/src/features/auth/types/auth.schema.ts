import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),
    password: z
        .string()
        .min(1, "La contraseña es obligatoria")
        .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginOtpSchema = z.object({
    code: z
        .string()
        .min(1, "El código es obligatorio")
        .regex(/^\d{6}$/, "Ingresa el código de 6 dígitos"),
});

export type LoginOtpFormValues = z.infer<typeof loginOtpSchema>;

export const passwordResetRequestSchema = z.object({
    email: z
        .string()
        .min(1, "El correo es obligatorio")
        .email("Ingresa un correo válido"),
});

export type PasswordResetRequestFormValues =
    z.infer<typeof passwordResetRequestSchema>;

export const passwordResetCompleteSchema = z
    .object({
        code: z
            .string()
            .min(1, "El código es obligatorio")
            .regex(/^\d{6}$/, "Ingresa el código de 6 dígitos"),
        newPassword: z
            .string()
            .min(8, "La contraseña debe tener mínimo 8 caracteres"),
        confirmPassword: z
            .string()
            .min(1, "Confirma tu nueva contraseña"),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type PasswordResetCompleteFormValues =
    z.infer<typeof passwordResetCompleteSchema>;

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, "Los nombres son obligatorios")
            .max(100, "Los nombres no deben superar 100 caracteres"),
        paternalLastName: z
            .string()
            .min(1, "El apellido paterno es obligatorio")
            .max(100, "El apellido paterno no debe superar 100 caracteres"),
        maternalLastName: z
            .string()
            .min(1, "El apellido materno es obligatorio")
            .max(100, "El apellido materno no debe superar 100 caracteres"),
        email: z
            .string()
            .min(1, "El correo es obligatorio")
            .email("Ingresa un correo válido"),
        password: z
            .string()
            .min(8, "La contraseña debe tener mínimo 8 caracteres"),
        confirmPassword: z
            .string()
            .min(1, "Confirma tu contraseña"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;
