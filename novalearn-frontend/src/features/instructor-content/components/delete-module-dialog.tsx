"use client";

import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { InstructorCourseModule } from "@/features/instructor-content/types/instructor-content.types";

interface DeleteModuleDialogProps {
  module: InstructorCourseModule | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteModuleDialog({
  module,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteModuleDialogProps) {
  return (
    <AlertDialog
      open={module !== null}
      onOpenChange={(open) => {
        if (!isDeleting) {
          onOpenChange(open);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar módulo
          </AlertDialogTitle>

          <AlertDialogDescription>
            Se eliminará el módulo{" "}
            <strong>{module?.title}</strong>. Esta
            operación también puede afectar las lecciones
            relacionadas con este módulo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}

            Eliminar módulo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}