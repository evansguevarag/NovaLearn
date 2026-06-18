package com.novalearn.admin.dashboard.dto;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private long totalStudents;
    private long totalInstructors;
    private long totalCourses;
    private long publishedCourses;
    private long totalEnrollments;
    private long completedEnrollments;
    private long totalCertificates;
    private BigDecimal totalRevenue;

    public DashboardSummaryResponse(
            long totalStudents,
            long totalInstructors,
            long totalCourses,
            long publishedCourses,
            long totalEnrollments,
            long completedEnrollments,
            long totalCertificates,
            BigDecimal totalRevenue
    ) {
        this.totalStudents = totalStudents;
        this.totalInstructors = totalInstructors;
        this.totalCourses = totalCourses;
        this.publishedCourses = publishedCourses;
        this.totalEnrollments = totalEnrollments;
        this.completedEnrollments = completedEnrollments;
        this.totalCertificates = totalCertificates;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalInstructors() {
        return totalInstructors;
    }

    public long getTotalCourses() {
        return totalCourses;
    }

    public long getPublishedCourses() {
        return publishedCourses;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public long getCompletedEnrollments() {
        return completedEnrollments;
    }

    public long getTotalCertificates() {
        return totalCertificates;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
}