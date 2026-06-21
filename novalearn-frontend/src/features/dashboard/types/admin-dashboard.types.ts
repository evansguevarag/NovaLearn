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
    studentEmail: string;
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

    export interface RevenueByMonth {
    month: string;
    revenue: number;
}