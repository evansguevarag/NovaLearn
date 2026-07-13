"use client";

import {
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ElementType } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CategoryFormDialog } from "@/features/admin-categories/components/category-form-dialog";
import { DeleteCategoryDialog } from "@/features/admin-categories/components/delete-category-dialog";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/features/admin-categories/services/admin-category.service";
import type {
  AdminCategory,
  AdminCategoryRequest,
} from "@/features/admin-categories/types/admin-category.types";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

export function AdminCategoriesClient() {
  const { isChecking } = useAuthGuard(["ADMIN"]);

  const [categories, setCategories] = useState<
    AdminCategory[]
  >([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [togglingCategoryId, setTogglingCategoryId] =
    useState<number | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<AdminCategory | null>(null);

  const loadCategories = useCallback(
    async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAdminCategories();
        setCategories(data);
      } catch (error: unknown) {
        setError(
          getApiErrorMessage(
            error,
            "No se pudieron cargar las categorías."
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isChecking) {
      return;
    }

    let isCancelled = false;

    async function initialize(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAdminCategories();

        if (!isCancelled) {
          setCategories(data);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(
              error,
              "No se pudieron cargar las categorías."
            )
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, [isChecking]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.description
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [categories, search]);

  const activeCategories = categories.filter(
    (category) => category.active
  ).length;

  const inactiveCategories =
    categories.length - activeCategories;

  function openCreateDialog(): void {
    setSelectedCategory(null);
    setIsFormOpen(true);
  }

  function openEditDialog(
    category: AdminCategory
  ): void {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }

  async function handleSaveCategory(
    request: AdminCategoryRequest
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      if (selectedCategory) {
        const updatedCategory =
          await updateAdminCategory(
            selectedCategory.id,
            request
          );

        setCategories((current) =>
          current.map((category) =>
            category.id === updatedCategory.id
              ? updatedCategory
              : category
          )
        );

        toast.success("Categoría actualizada.", {
          description:
            "Los cambios fueron guardados correctamente.",
        });
      } else {
        const createdCategory =
          await createAdminCategory(request);

        setCategories((current) => [
          createdCategory,
          ...current,
        ]);

        toast.success("Categoría creada.", {
          description:
            "La nueva categoría ya está disponible.",
        });
      }

      setIsFormOpen(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        selectedCategory
          ? "No se pudo actualizar la categoría."
          : "No se pudo crear la categoría."
      );

      setError(message);

      toast.error("Operación no completada.", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(
    category: AdminCategory
  ): Promise<void> {
    if (togglingCategoryId === category.id) {
      return;
    }

    try {
      setError(null);
      setTogglingCategoryId(category.id);

      const updatedCategory =
        await updateAdminCategory(category.id, {
          name: category.name,
          description: category.description,
          active: !category.active,
        });

      setCategories((current) =>
        current.map((item) =>
          item.id === updatedCategory.id
            ? updatedCategory
            : item
        )
      );

      const toastOptions = {
        id: `category-status-${updatedCategory.id}`,
        description: updatedCategory.active
          ? "Ahora puede utilizarse en cursos nuevos."
          : "Ya no aparecerá como opción para cursos nuevos.",
      };

      if (updatedCategory.active) {
        toast.success(
          "Categoría activada.",
          toastOptions
        );
      } else {
        toast.warning(
          "Categoría desactivada.",
          toastOptions
        );
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "No se pudo cambiar el estado de la categoría."
      );

      setError(message);

      toast.error("No se pudo cambiar el estado.", {
        id: `category-status-${category.id}`,
        description: message,
      });
    } finally {
      setTogglingCategoryId(null);
    }
  }

  async function handleDeleteCategory(): Promise<void> {
    if (!categoryToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await deleteAdminCategory(
        categoryToDelete.id
      );

      setCategories((current) =>
        current.filter(
          (category) =>
            category.id !== categoryToDelete.id
        )
      );

      toast.success("Categoría eliminada.", {
        description:
          "La categoría fue eliminada correctamente.",
      });

      setCategoryToDelete(null);
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "No se pudo eliminar la categoría. Puede tener cursos asociados."
      );

      setError(message);

      toast.error("No se pudo eliminar.", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isChecking) {
    return (
      <main className="p-8">
        Validando sesión...
      </main>
    );
  }

  return (
    <>
      <DashboardShell
        title="Gestión de categorías"
        description="Organiza las categorías académicas del catálogo de NovaLearn."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        }
      >
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>

              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <section className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              title="Categorías totales"
              value={categories.length}
              icon={FolderOpen}
            />

            <MetricCard
              title="Categorías activas"
              value={activeCategories}
              icon={Power}
            />

            <MetricCard
              title="Categorías inactivas"
              value={inactiveCategories}
              icon={PowerOff}
            />
          </section>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Categorías
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {filteredCategories.length} de{" "}
                    {categories.length} categorías
                  </p>
                </div>

                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    void loadCategories()
                  }
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FolderPlus className="mr-2 h-4 w-4" />
                  )}

                  Actualizar
                </Button>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  className="pl-9"
                  placeholder="Buscar por nombre, slug o descripción..."
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </CardHeader>

            <CardContent className="min-w-0">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-212.5 table-fixed text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="w-[22%] px-4 py-3 text-left font-medium">
                        Categoría
                      </th>

                      <th className="w-[34%] px-4 py-3 text-left font-medium">
                        Descripción
                      </th>

                      <th className="w-[16%] px-4 py-3 text-left font-medium">
                        Estado
                      </th>

                      <th className="w-[16%] px-4 py-3 text-left font-medium">
                        Actualización
                      </th>

                      <th className="w-[12%] px-4 py-3 text-right font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-14 text-center text-muted-foreground"
                        >
                          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                          Cargando categorías...
                        </td>
                      </tr>
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-14 text-center text-muted-foreground"
                        >
                          No se encontraron categorías.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map(
                        (category) => (
                          <tr
                            key={category.id}
                            className="border-b last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-4 align-top">
                              <p className="wrap-break-word font-medium">
                                {category.name}
                              </p>

                              <p className="mt-1 break-all text-xs text-muted-foreground">
                                /{category.slug}
                              </p>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <p className="line-clamp-3 whitespace-normal text-muted-foreground">
                                {category.description}
                              </p>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <Badge
                                variant={
                                  category.active
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {category.active
                                  ? "Activa"
                                  : "Inactiva"}
                              </Badge>
                            </td>

                            <td className="px-4 py-4 align-top text-muted-foreground">
                              {formatDate(
                                category.updatedAt
                              )}
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="flex justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Editar categoría"
                                  aria-label={`Editar ${category.name}`}
                                  onClick={() =>
                                    openEditDialog(
                                      category
                                    )
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title={
                                    category.active
                                      ? "Desactivar categoría"
                                      : "Activar categoría"
                                  }
                                  aria-label={
                                    category.active
                                      ? `Desactivar ${category.name}`
                                      : `Activar ${category.name}`
                                  }
                                  onClick={() =>
                                    void handleToggleStatus(
                                      category
                                    )
                                  }
                                  disabled={
                                    togglingCategoryId ===
                                    category.id
                                  }
                                >
                                  {togglingCategoryId ===
                                  category.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : category.active ? (
                                    <PowerOff className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Eliminar categoría"
                                  aria-label={`Eliminar ${category.name}`}
                                  onClick={() =>
                                    setCategoryToDelete(
                                      category
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>

      <CategoryFormDialog
      key={selectedCategory?.id ?? "new-category"}
      open={isFormOpen}
      category={selectedCategory}
      isSubmitting={isSubmitting}
      onOpenChange={(open) => {
        setIsFormOpen(open);

        if (!open) {
          setSelectedCategory(null);
        }
      }}
      onSubmit={handleSaveCategory}
    />

      <DeleteCategoryDialog
        category={categoryToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: ElementType;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
