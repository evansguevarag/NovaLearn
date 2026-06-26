import { api } from "@/lib/api";

import type {
  AdminCategory,
  AdminCategoryRequest,
} from "@/features/admin-categories/types/admin-category.types";

const CATEGORY_ENDPOINT = "/admin/course-categories";

export async function getAdminCategories(): Promise<
  AdminCategory[]
> {
  const response = await api.get<AdminCategory[]>(
    CATEGORY_ENDPOINT
  );

  return response.data;
}

export async function getAdminCategoryById(
  categoryId: number
): Promise<AdminCategory> {
  const response = await api.get<AdminCategory>(
    `${CATEGORY_ENDPOINT}/${categoryId}`
  );

  return response.data;
}

export async function createAdminCategory(
  request: AdminCategoryRequest
): Promise<AdminCategory> {
  const response = await api.post<AdminCategory>(
    CATEGORY_ENDPOINT,
    request
  );

  return response.data;
}

export async function updateAdminCategory(
  categoryId: number,
  request: AdminCategoryRequest
): Promise<AdminCategory> {
  const response = await api.put<AdminCategory>(
    `${CATEGORY_ENDPOINT}/${categoryId}`,
    request
  );

  return response.data;
}

export async function deleteAdminCategory(
  categoryId: number
): Promise<void> {
  await api.delete(
    `${CATEGORY_ENDPOINT}/${categoryId}`
  );
}
