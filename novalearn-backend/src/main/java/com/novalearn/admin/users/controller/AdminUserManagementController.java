package com.novalearn.admin.users.controller;

import com.novalearn.admin.users.dto.AdminCreateUserRequest;
import com.novalearn.admin.users.dto.AdminEmailAvailabilityResponse;
import com.novalearn.admin.users.dto.AdminUpdateUserRoleRequest;
import com.novalearn.admin.users.dto.AdminUpdateUserStatusRequest;
import com.novalearn.admin.users.dto.AdminUserResponse;
import com.novalearn.admin.users.service.AdminUserManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserManagementController {

    private final AdminUserManagementService userManagementService;

    public AdminUserManagementController(AdminUserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> findAll() {
        return ResponseEntity.ok(userManagementService.findAll());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserResponse> findById(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(userManagementService.findById(userId));
    }

    @GetMapping("/email-availability")
    public ResponseEntity<AdminEmailAvailabilityResponse> checkEmailAvailability(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(
                userManagementService.checkEmailAvailability(email)
        );
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> create(
            @Valid @RequestBody AdminCreateUserRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userManagementService.create(request));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<AdminUserResponse> updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRoleRequest request
    ) {
        return ResponseEntity.ok(
                userManagementService.updateRole(userId, request)
        );
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<AdminUserResponse> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(
                userManagementService.updateStatus(userId, request)
        );
    }
}
