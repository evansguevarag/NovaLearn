package com.novalearn.student.dashboard.dto;

import java.math.BigDecimal;

public class StudentDashboardSummaryResponse {

    private Long studentId;
    private String studentEmail;
    private long enrolledCourses;
    private long completedCourses;
    private long certificates;
    private BigDecimal averageProgress;
    private BigDecimal totalPaid;

    public StudentDashboardSummaryResponse(
            Long studentId,
            String studentEmail,
            long enrolledCourses,
            long completedCourses,
            long certificates,
            BigDecimal averageProgress,
            BigDecimal totalPaid
    ) {
        this.studentId = studentId;
        this.studentEmail = studentEmail;
        this.enrolledCourses = enrolledCourses;
        this.completedCourses = completedCourses;
        this.certificates = certificates;
        this.averageProgress = averageProgress;
        this.totalPaid = totalPaid;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public long getEnrolledCourses() {
        return enrolledCourses;
    }

    public long getCompletedCourses() {
        return completedCourses;
    }

    public long getCertificates() {
        return certificates;
    }

    public BigDecimal getAverageProgress() {
        return averageProgress;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }
}