"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/services/auth.service";
import { clearAuthSession } from "@/lib/auth-storage";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      /*
       * Aunque el backend no responda, cerramos la sesión local para no
       * dejar al usuario atrapado en una sesión inválida.
       */
    } finally {
      clearAuthSession();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Cerrar sesión?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tendrás que iniciar sesión nuevamente para volver a entrar a
            NovaLearn.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleLogout();
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
