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