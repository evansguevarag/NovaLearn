import { api } from "@/lib/api";

import type {
  StudentCatalogCategory,
  StudentCatalogCourse,
  StudentCatalogEnrollment,
  StudentCatalogFilters,
  StudentCatalogPayment,
  StudentPaymentSettings,
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

export async function getStudentPaymentSettings():
  Promise<StudentPaymentSettings> {
  const response = await api.get<StudentPaymentSettings>(
    "/student/payments/settings"
  );

  return response.data;
}

export async function createManualStudentCoursePayment(
  courseId: number,
  method: string,
  reference: string,
  file: File
): Promise<StudentCatalogPayment> {
  const formData = new FormData();
  formData.append("courseId", String(courseId));
  formData.append("method", method);
  formData.append("reference", reference);
  formData.append("file", file);

  const response = await api.post<StudentCatalogPayment>(
    "/student/payments/manual",
    formData
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

export async function createCulqiOrder(
  paymentId: number
): Promise<StudentCatalogPayment> {
  const response = await api.post<StudentCatalogPayment>(
    `/student/payments/${paymentId}/culqi/order`
  );

  return response.data;
}

export async function confirmCulqiOrder(
  paymentId: number
): Promise<StudentCatalogPayment> {
  const response = await api.post<StudentCatalogPayment>(
    `/student/payments/${paymentId}/culqi/order/confirm`
  );

  return response.data;
}

export async function cancelStudentCoursePayment(
  paymentId: number
): Promise<StudentCatalogPayment> {
  const response = await api.post<StudentCatalogPayment>(
    `/student/payments/${paymentId}/cancel`
  );

  return response.data;
}
