export interface StudentDashboardSummary {
    studentId: number;
    studentEmail: string;
    enrolledCourses: number;
    completedCourses: number;
    certificates: number;
    averageProgress: number;
    totalPaid: number;
    }

    export interface StudentCourse {
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    courseSlug: string;
    thumbnailUrl: string;
    categoryName: string;
    progressPercentage: number;
    enrolledAt: string;
    completedAt: string | null;
    }

    export interface StudentCertificate {
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    courseSlug: string;
    thumbnailUrl: string;
    categoryName: string;
    progressPercentage: number;
    enrolledAt: string;
    completedAt: string | null;
    }

    export interface StudentPayment {
    id: number;
    courseId: number;
    courseTitle: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    createdAt: string;
}