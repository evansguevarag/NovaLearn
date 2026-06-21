import axios from "axios";

export function getApiErrorMessage(
    error: unknown,
    fallback = "Ocurrió un error inesperado."
    ): string {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string" && message.trim().length > 0) {
        return message;
        }

        if (error.response?.status === 401) {
        return "No autorizado. Inicia sesión nuevamente.";
        }

        if (error.response?.status === 403) {
        return "No tienes permisos para realizar esta acción.";
        }

        if (error.response?.status === 404) {
        return "Recurso no encontrado.";
        }

        if (error.response?.status === 500) {
        return "Error interno del servidor.";
        }
    }

    return fallback;
}