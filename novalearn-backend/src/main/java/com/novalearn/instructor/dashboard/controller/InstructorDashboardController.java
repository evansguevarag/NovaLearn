package com.novalearn.instructor.dashboard.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.dashboard.dto.InstructorCourseResponse;
import com.novalearn.instructor.dashboard.dto.InstructorDashboardSummaryResponse;
import com.novalearn.instructor.dashboard.dto.InstructorEnrollmentResponse;
import com.novalearn.instructor.dashboard.service.InstructorDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor/dashboard")
public class InstructorDashboardController {

    private final InstructorDashboardService dashboardService;

    public InstructorDashboardController(InstructorDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<InstructorDashboardSummaryResponse> getSummary(
            Authentication authentication
    ) {
        User instructor = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getSummary(instructor)
        );
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<InstructorCourseResponse>> getMyCourses(
            Authentication authentication
    ) {
        User instructor = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getMyCourses(instructor)
        );
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<InstructorEnrollmentResponse>> getMyEnrollments(
            Authentication authentication
    ) {
        User instructor = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                dashboardService.getMyEnrollments(instructor)
        );
    }
}
