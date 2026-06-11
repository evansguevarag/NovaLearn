package com.novalearn.notification.email.controller;

import com.novalearn.notification.email.dto.EmailRequest;
import com.novalearn.notification.email.dto.EmailResponse;
import com.novalearn.notification.email.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/emails")
public class EmailAdminController {

    private final EmailService emailService;

    public EmailAdminController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-test")
    public ResponseEntity<EmailResponse> sendTestEmail(
            @Valid @RequestBody EmailRequest request
    ) {
        return ResponseEntity.ok(
                emailService.sendEmail(
                        request.getTo(),
                        request.getSubject(),
                        request.getHtml()
                )
        );
    }
}