import { notFound } from "next/navigation";

import { AdminCertificateTemplateClient } from "@/features/certificate-templates/components/admin-certificate-template-client";

interface AdminCourseCertificateTemplatePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function AdminCourseCertificateTemplatePage({
  params,
}: AdminCourseCertificateTemplatePageProps) {
  const { courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (
    !Number.isInteger(parsedCourseId) ||
    parsedCourseId <= 0
  ) {
    notFound();
  }

  return (
    <AdminCertificateTemplateClient
      courseId={parsedCourseId}
    />
  );
}
