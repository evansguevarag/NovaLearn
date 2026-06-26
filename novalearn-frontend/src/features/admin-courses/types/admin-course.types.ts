export type CourseType = "FREE" | "PAID";

export type CourseStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";

    export interface AdminCourse {
    id: number;
    instructorId: number;
    instructorEmail: string;
    categoryId: number;
    categoryName: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    requirements: string;
    targetAudience: string;
    thumbnailUrl: string | null;
    price: number;
    courseType: CourseType;
    status: CourseStatus;
    level: string;
    certificateEnabled: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    }

    export interface CourseCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
    }

    export interface AdminCourseRequest {
    instructorId: number;
    categoryId: number;
    title: string;
    shortDescription: string;
    description: string;
    requirements: string;
    targetAudience: string;
    thumbnailUrl: string | null;
    price: number;
    courseType: CourseType;
    status: CourseStatus;
    level: string;
    certificateEnabled: boolean;
}

export interface CourseThumbnailUploadResponse {
    url: string;
    publicId: string;
    resourceType: string;
    format: string;
}