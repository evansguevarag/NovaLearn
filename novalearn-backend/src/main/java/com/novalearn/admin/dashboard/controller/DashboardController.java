package com.novalearn.admin.dashboard.controller;

import com.novalearn.admin.dashboard.dto.*;
import com.novalearn.admin.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(
                dashboardService.getSummary()
        );
    }

    @GetMapping("/latest-students")
    public ResponseEntity<List<LatestStudentResponse>> getLatestStudents() {
        return ResponseEntity.ok(
                dashboardService.getLatestStudents()
        );
    }

    @GetMapping("/latest-enrollments")
    public ResponseEntity<List<LatestEnrollmentResponse>> getLatestEnrollments() {
        return ResponseEntity.ok(
                dashboardService.getLatestEnrollments()
        );
    }

    @GetMapping("/top-courses")
    public ResponseEntity<List<TopCourseResponse>> getTopCourses() {
        return ResponseEntity.ok(
                dashboardService.getTopCourses()
        );
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<MonthlyRevenueResponse>> getRevenueByMonth() {
        return ResponseEntity.ok(
                dashboardService.getRevenueByMonth()
        );
    }
}