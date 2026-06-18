package com.novalearn.student.dashboard.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.student.dashboard.dto.StudentCertificateDashboardResponse;
import com.novalearn.student.dashboard.dto.StudentCourseDashboardResponse;
import com.novalearn.student.dashboard.dto.StudentDashboardSummaryResponse;
import com.novalearn.student.dashboard.dto.StudentPaymentDashboardResponse;
import com.novalearn.student.dashboard.service.StudentDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/dashboard")
public class StudentDashboardController {

    private final StudentDashboardService dashboardService;

    public StudentDashboardController(StudentDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<StudentDashboardSummaryResponse> getSummary(
            Authentication authentication
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getSummary(student)
        );
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<StudentCourseDashboardResponse>> getMyCourses(
            Authentication authentication
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getMyCourses(student)
        );
    }

    @GetMapping("/my-certificates")
    public ResponseEntity<List<StudentCertificateDashboardResponse>> getMyCertificates(
            Authentication authentication
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getMyCertificates(student)
        );
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<StudentPaymentDashboardResponse>> getMyPayments(
            Authentication authentication
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getMyPayments(student)
        );
    }
}
