package com.novalearn.audit.repository;

import com.novalearn.audit.entity.AuditLog;
import com.novalearn.audit.enums.AuditAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop100ByOrderByCreatedAtDesc();

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action);

    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(
            String entityName,
            String entityId
    );
}