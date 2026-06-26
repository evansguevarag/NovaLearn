export type CourseType = "FREE" | "PAID";

export type CourseStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface InstructorCourse {
  id: number;
  instructorId: number;
  instructorEmail: string;
  categoryId: number;
  categoryName: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  requirements: string | null;
  targetAudience: string | null;
  thumbnailUrl: string | null;
  price: number;
  courseType: CourseType;
  status: CourseStatus;
  level: string | null;
  certificateEnabled: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorCourseRequest {
  categoryId: number;
  title: string;
  shortDescription: string;
  description: string;
  requirements: string;
  targetAudience: string;
  price: number;
  courseType: CourseType;
  level: string;
  certificateEnabled: boolean;
}

export interface InstructorCourseCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseThumbnailUploadResponse {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
}
