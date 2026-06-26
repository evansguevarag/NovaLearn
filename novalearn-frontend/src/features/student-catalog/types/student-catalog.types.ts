export type StudentCatalogCourseType = "FREE" | "PAID";

export interface StudentCatalogCourse {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  requirements: string | null;
  targetAudience: string | null;
  thumbnailUrl: string | null;
  price: number;
  courseType: StudentCatalogCourseType;
  level: string | null;
  certificateEnabled: boolean;
  categoryId: number;
  categoryName: string;
  instructorId: number;
  instructorName: string;
  enrolled: boolean;
}

export interface StudentCatalogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface StudentCatalogFilters {
  query?: string;
  categoryId?: number;
  courseType?: StudentCatalogCourseType;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface StudentCatalogEnrollment {
  id: number;
  studentId: number;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercentage: number;
  active: boolean;
}

export type StudentCatalogPaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface StudentCatalogPayment {
  id: number;
  studentId: number;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  amount: number;
  currency: string;
  status: StudentCatalogPaymentStatus;
  provider: string;
  providerPaymentId: string | null;
  createdAt: string;
}
