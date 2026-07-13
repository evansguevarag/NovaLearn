import { api } from "@/lib/api";

import type {
  CourseCertificateTemplate,
  UpdateCourseCertificateTemplateLayoutRequest,
} from "@/features/certificate-templates/types/certificate-template.types";

export async function getAdminCourseCertificateTemplate(
  courseId: number
): Promise<CourseCertificateTemplate> {
  const response =
    await api.get<CourseCertificateTemplate>(
      `/admin/courses/${courseId}/certificate-template`
    );

  return response.data;
}

export async function uploadAdminCourseCertificateTemplate(
  courseId: number,
  file: File
): Promise<CourseCertificateTemplate> {
  const formData = new FormData();
  formData.append("file", file);

  const response =
    await api.post<CourseCertificateTemplate>(
      `/admin/courses/${courseId}/certificate-template`,
      formData
    );

  return response.data;
}

export async function updateAdminCourseCertificateTemplateLayout(
  courseId: number,
  request: UpdateCourseCertificateTemplateLayoutRequest
): Promise<CourseCertificateTemplate> {
  const response =
    await api.put<CourseCertificateTemplate>(
      `/admin/courses/${courseId}/certificate-template`,
      request
    );

  return response.data;
}

export async function getInstructorCourseCertificateTemplate(
  courseId: number
): Promise<CourseCertificateTemplate> {
  const response =
    await api.get<CourseCertificateTemplate>(
      `/instructor/courses/${courseId}/certificate-template`
    );

  return response.data;
}

export async function uploadInstructorCourseCertificateTemplate(
  courseId: number,
  file: File
): Promise<CourseCertificateTemplate> {
  const formData = new FormData();
  formData.append("file", file);

  const response =
    await api.post<CourseCertificateTemplate>(
      `/instructor/courses/${courseId}/certificate-template`,
      formData
    );

  return response.data;
}

export async function updateInstructorCourseCertificateTemplateLayout(
  courseId: number,
  request: UpdateCourseCertificateTemplateLayoutRequest
): Promise<CourseCertificateTemplate> {
  const response =
    await api.put<CourseCertificateTemplate>(
      `/instructor/courses/${courseId}/certificate-template`,
      request
    );

  return response.data;
}
