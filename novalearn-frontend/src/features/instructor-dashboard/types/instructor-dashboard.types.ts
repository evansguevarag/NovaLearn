export interface InstructorDashboardSummary {
    instructorId: number;
    instructorEmail: string;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    totalRevenue: number;
    }

    export interface InstructorCourse {
    id: number;
    title: string;
    slug: string;
    categoryName: string;
    status: string;
    courseType: string;
    price: number;
    level: string;
    thumbnailUrl: string | null;
    createdAt: string;
    publishedAt: string | null;
    }

    export interface InstructorEnrollment {
    enrollmentId: number;
    studentId: number;
    studentEmail: string;
    studentName: string;
    courseId: number;
    courseTitle: string;
    progressPercentage: number;
    enrolledAt: string;
    completedAt: string | null;
}