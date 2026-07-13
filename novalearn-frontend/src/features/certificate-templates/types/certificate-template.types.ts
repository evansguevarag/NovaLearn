export interface CourseCertificateTemplate {
  id: number;
  courseId: number;
  templateUrl: string;
  studentNameX: number;
  studentNameY: number;
  courseTitleX: number;
  courseTitleY: number;
  issuedAtX: number;
  issuedAtY: number;
  certificateCodeX: number;
  certificateCodeY: number;
  qrX: number;
  qrY: number;
  primaryTextColor: string;
  active: boolean;
  updatedAt: string | null;
}

export interface UpdateCourseCertificateTemplateLayoutRequest {
  studentNameX: number;
  studentNameY: number;
  courseTitleX: number;
  courseTitleY: number;
  issuedAtX: number;
  issuedAtY: number;
  certificateCodeX: number;
  certificateCodeY: number;
  qrX: number;
  qrY: number;
  primaryTextColor: string;
}
