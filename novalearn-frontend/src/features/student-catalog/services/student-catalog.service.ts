import { api } from "@/lib/api";

import type {
  StudentCatalogCategory,
  StudentCatalogCourse,
  StudentCatalogEnrollment,
  StudentCatalogFilters,
  StudentCatalogPayment,
} from "@/features/student-catalog/types/student-catalog.types";

export async function getStudentCatalogCourses(
  filters: StudentCatalogFilters
): Promise<StudentCatalogCourse[]> {
  const response = await api.get<StudentCatalogCourse[]>(
    "/student/catalog/courses",
    {
      params: filters,
    }
  );

  return response.data;
}

export async function getStudentCatalogCategories():
  Promise<StudentCatalogCategory[]> {
  const response = await api.get<StudentCatalogCategory[]>(
    "/student/catalog/categories"
  );

  return response.data;
}

export async function enrollFreeStudentCourse(
  courseId: number
): Promise<StudentCatalogEnrollment> {
  const response = await api.post<StudentCatalogEnrollment>(
    `/student/catalog/courses/${courseId}/enroll`
  );

  return response.data;
}

export async function createStudentCoursePayment(
  courseId: number
): Promise<StudentCatalogPayment> {
  const response = await api.post<StudentCatalogPayment>(
    "/student/payments/create",
    {
      courseId,
    }
  );

  return response.data;
}

export async function createCulqiCharge(
  paymentId: number,
  sourceId: string
): Promise<StudentCatalogPayment> {
  const response = await api.post<StudentCatalogPayment>(
    `/student/payments/${paymentId}/culqi/charge`,
    {
      sourceId,
    }
  );

  return response.data;
}
