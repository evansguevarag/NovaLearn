export interface AdminDashboardSummary {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    totalCertificates: number;
    totalRevenue: number;
    }

    export interface LatestStudent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    createdAt: string;
    }

    export interface LatestEnrollment {
    id: number;
    studentId: number;
    studentName?: string | null;
    studentEmail?: string | null;
    courseId: number;
    courseTitle: string;
    progressPercentage: number;
    enrolledAt: string;
    }

    export interface TopCourse {
    courseId: number;
    courseTitle: string;
    totalEnrollments: number;
    }

    export interface RevenuePayment {
    paymentId?: number | null;
    courseId?: number | null;
    courseTitle?: string | null;
    studentId?: number | null;
    studentName?: string | null;
    studentEmail?: string | null;
    amount?: number | null;
    subtotalAmount?: number | null;
    processingFeeAmount?: number | null;
    taxAmount?: number | null;
    totalAmount?: number | null;
    currency?: string | null;
    paidAt?: string | number[] | null;
    month?: string | null;
    revenue?: number | null;
}
