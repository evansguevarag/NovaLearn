package com.novalearn.notification.internal.repository;

import com.novalearn.notification.internal.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    List<UserNotification> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    List<UserNotification> findByUserIdAndReadAtIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    Optional<UserNotification> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    long countByUserIdAndReadAtIsNullAndDeletedAtIsNull(Long userId);
}