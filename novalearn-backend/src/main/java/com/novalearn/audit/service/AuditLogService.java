package com.novalearn.audit.service;

import com.novalearn.audit.dto.AuditLogResponse;
import com.novalearn.audit.entity.AuditLog;
import com.novalearn.audit.enums.AuditAction;
import com.novalearn.audit.repository.AuditLogRepository;
import com.novalearn.core.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void register(
            User user,
            AuditAction action,
            String entityName,
            String entityId,
            String description,
            HttpServletRequest request
    ) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setDescription(description);

        if (request != null) {
            auditLog.setIpAddress(extractClientIp(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
        }

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findLatest() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(AuditLogResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(AuditLogResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByAction(AuditAction action) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action)
                .stream()
                .map(AuditLogResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findByEntity(String entityName, String entityId) {
        return auditLogRepository
                .findByEntityNameAndEntityIdOrderByCreatedAtDesc(entityName, entityId)
                .stream()
                .map(AuditLogResponse::new)
                .toList();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}