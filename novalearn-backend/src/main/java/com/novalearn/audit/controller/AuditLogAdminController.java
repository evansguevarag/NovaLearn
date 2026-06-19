package com.novalearn.audit.controller;

import com.novalearn.audit.dto.AuditLogResponse;
import com.novalearn.audit.enums.AuditAction;
import com.novalearn.audit.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
public class AuditLogAdminController {

    private final AuditLogService auditLogService;

    public AuditLogAdminController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> findLatest() {
        return ResponseEntity.ok(
                auditLogService.findLatest()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> findByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                auditLogService.findByUser(userId)
        );
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogResponse>> findByAction(
            @PathVariable AuditAction action
    ) {
        return ResponseEntity.ok(
                auditLogService.findByAction(action)
        );
    }

    @GetMapping("/entity")
    public ResponseEntity<List<AuditLogResponse>> findByEntity(
            @RequestParam String entityName,
            @RequestParam String entityId
    ) {
        return ResponseEntity.ok(
                auditLogService.findByEntity(entityName, entityId)
        );
    }
}