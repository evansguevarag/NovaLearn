package com.novalearn.audit.dto;

import com.novalearn.audit.entity.AuditLog;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String entityName;
    private String entityId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;

    public AuditLogResponse(AuditLog auditLog) {
        this.id = auditLog.getId();

        if (auditLog.getUser() != null) {
            this.userId = auditLog.getUser().getId();
            this.userEmail = auditLog.getUser().getEmail();
        }

        this.action = auditLog.getAction().name();
        this.entityName = auditLog.getEntityName();
        this.entityId = auditLog.getEntityId();
        this.description = auditLog.getDescription();
        this.ipAddress = auditLog.getIpAddress();
        this.userAgent = auditLog.getUserAgent();
        this.createdAt = auditLog.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getAction() {
        return action;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getEntityId() {
        return entityId;
    }

    public String getDescription() {
        return description;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}