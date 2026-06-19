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