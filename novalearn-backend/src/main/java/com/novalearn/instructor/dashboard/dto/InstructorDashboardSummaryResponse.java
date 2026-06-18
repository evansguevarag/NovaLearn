package com.novalearn.instructor.dashboard.dto;

import java.math.BigDecimal;

public class InstructorDashboardSummaryResponse {

    private Long instructorId;
    private String instructorEmail;
    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;
    private long totalEnrollments;
    private long completedEnrollments;
    private BigDecimal totalRevenue;

    public InstructorDashboardSummaryResponse(
            Long instructorId,
            String instructorEmail,
            long totalCourses,
            long publishedCourses,
            long draftCourses,
            long totalEnrollments,
            long completedEnrollments,
            BigDecimal totalRevenue
    ) {
        this.instructorId = instructorId;
        this.instructorEmail = instructorEmail;
        this.totalCourses = totalCourses;
        this.publishedCourses = publishedCourses;
        this.draftCourses = draftCourses;
        this.totalEnrollments = totalEnrollments;
        this.completedEnrollments = completedEnrollments;
        this.totalRevenue = totalRevenue;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public String getInstructorEmail() {
        return instructorEmail;
    }

    public long getTotalCourses() {
        return totalCourses;
    }

    public long getPublishedCourses() {
        return publishedCourses;
    }

    public long getDraftCourses() {
        return draftCourses;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public long getCompletedEnrollments() {
        return completedEnrollments;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
}