package com.novalearn.profile.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.profile.dto.ChangePasswordRequest;
import com.novalearn.profile.dto.ProfileMessageResponse;
import com.novalearn.profile.dto.UpdateProfileRequest;
import com.novalearn.profile.dto.UserProfileResponse;
import com.novalearn.profile.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                profileService.getProfile(user)
        );
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                profileService.updateProfile(user, request)
        );
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ProfileMessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                profileService.changePassword(user, request)
        );
    }
}