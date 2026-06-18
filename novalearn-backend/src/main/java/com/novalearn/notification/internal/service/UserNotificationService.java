package com.novalearn.notification.internal.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.repository.UserRepository;
import com.novalearn.notification.internal.dto.CreateNotificationRequest;
import com.novalearn.notification.internal.dto.NotificationResponse;
import com.novalearn.notification.internal.dto.UnreadNotificationCountResponse;
import com.novalearn.notification.internal.entity.UserNotification;
import com.novalearn.notification.internal.enums.NotificationType;
import com.novalearn.notification.internal.repository.UserNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserNotificationService {

    private final UserNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public UserNotificationService(
            UserNotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setTitle(request.getTitle().trim());
        notification.setMessage(request.getMessage().trim());
        notification.setNotificationType(
                request.getNotificationType() != null
                        ? request.getNotificationType()
                        : NotificationType.SYSTEM
        );

        return new NotificationResponse(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse createSystemNotification(
            User user,
            String title,
            String message,
            NotificationType type
    ) {
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type != null ? type : NotificationType.SYSTEM);

        return new NotificationResponse(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findMine(User user) {
        return notificationRepository
                .findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findUnread(User user) {
        return notificationRepository
                .findByUserIdAndReadAtIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse countUnread(User user) {
        long count = notificationRepository
                .countByUserIdAndReadAtIsNullAndDeletedAtIsNull(user.getId());

        return new UnreadNotificationCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(User user, Long notificationId) {
        UserNotification notification = notificationRepository
                .findByIdAndUserIdAndDeletedAtIsNull(notificationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notificacion no encontrada"));

        notification.markAsRead();

        return new NotificationResponse(notification);
    }

    @Transactional
    public void deleteMine(User user, Long notificationId) {
        UserNotification notification = notificationRepository
                .findByIdAndUserIdAndDeletedAtIsNull(notificationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notificacion no encontrada"));

        notification.softDelete();
    }
}