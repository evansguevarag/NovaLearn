package com.novalearn.notification.internal.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.notification.internal.dto.CreateNotificationRequest;
import com.novalearn.notification.internal.dto.NotificationResponse;
import com.novalearn.notification.internal.dto.UnreadNotificationCountResponse;
import com.novalearn.notification.internal.service.UserNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class UserNotificationController {

    private final UserNotificationService notificationService;

    public UserNotificationController(UserNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/admin/notifications")
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        return ResponseEntity.ok(
                notificationService.create(request)
        );
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> findMine(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService.findMine(user)
        );
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<List<NotificationResponse>> findUnread(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService.findUnread(user)
        );
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<UnreadNotificationCountResponse> countUnread(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService.countUnread(user)
        );
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            Authentication authentication,
            @PathVariable Long notificationId
    ) {
        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService.markAsRead(user, notificationId)
        );
    }

    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<Void> deleteMine(
            Authentication authentication,
            @PathVariable Long notificationId
    ) {
        User user = (User) authentication.getPrincipal();

        notificationService.deleteMine(user, notificationId);

        return ResponseEntity.noContent().build();
    }
}
