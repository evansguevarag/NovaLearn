package com.novalearn.admin.dashboard.dto;

public class TopCourseResponse {

    private Long courseId;
    private String courseTitle;
    private Long totalEnrollments;

    public TopCourseResponse(Long courseId, String courseTitle, Long totalEnrollments) {
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.totalEnrollments = totalEnrollments;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public Long getTotalEnrollments() {
        return totalEnrollments;
    }
}