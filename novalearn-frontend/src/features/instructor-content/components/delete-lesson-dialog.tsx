"use client";

import {
  Loader2,
  Trash2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";

import type {
  InstructorLesson,
} from "@/features/instructor-content/types/instructor-content.types";

interface DeleteLessonDialogProps {
  open: boolean;
  lesson: InstructorLesson | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    lesson: InstructorLesson
  ) => Promise<void>;
}

export function DeleteLessonDialog({
  open,
  lesson,
  onOpenChange,
  onConfirm,
}: DeleteLessonDialogProps) {
  const [isDeleting, setIsDeleting] =
    useState(false);

  async function handleConfirm():
    Promise<void> {
    if (!lesson) {
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirm(lesson);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </div>

          <AlertDialogTitle>
            Eliminar lección
          </AlertDialogTitle>

          <AlertDialogDescription>
            {lesson
              ? `La lección “${lesson.title}” será eliminada del módulo. Esta acción no puede deshacerse.`
              : "La lección seleccionada será eliminada. Esta acción no puede deshacerse."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={
              isDeleting || !lesson
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isDeleting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}

            Eliminar lección
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}