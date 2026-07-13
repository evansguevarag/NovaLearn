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
    id: number;
    enrollmentId: number;
    courseId: number;
    courseTitle: string;
    certificateCode: string;
    certificateUrl: string | null;
    issuedAt: string;
    }

    export interface StudentPayment {
    id: number;
    courseId: number;
    courseTitle: string;
    amount: number;
    subtotalAmount: number;
    processingFeeAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    provider: string;
    manualMethod: string | null;
    manualReference: string | null;
    manualProofUrl: string | null;
    manualProofResourceType: string | null;
    manualReviewedAt: string | null;
    manualRejectionReason: string | null;
    createdAt: string;
    paidAt: string | null;
}
