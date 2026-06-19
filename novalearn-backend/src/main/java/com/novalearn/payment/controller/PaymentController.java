package com.novalearn.payment.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.payment.dto.ConfirmPaymentRequest;
import com.novalearn.payment.dto.CreatePaymentRequest;
import com.novalearn.payment.dto.PaymentResponse;
import com.novalearn.payment.dto.PaymentTransactionResponse;
import com.novalearn.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

        private final PaymentService paymentService;

        public PaymentController(PaymentService paymentService) {
                this.paymentService = paymentService;
        }

        @PostMapping("/student/payments/create")
        public ResponseEntity<PaymentResponse> createPayment(
                Authentication authentication,
                @Valid @RequestBody CreatePaymentRequest request
        ) {
                User student = (User) authentication.getPrincipal();

                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(paymentService.createPayment(student, request));
        }

        @PostMapping("/student/payments/confirm")
        public ResponseEntity<PaymentResponse> confirmPayment(
                Authentication authentication,
                @Valid @RequestBody ConfirmPaymentRequest request,
                HttpServletRequest httpRequest
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.confirmPayment(student, request, httpRequest)
        );
        }

        @GetMapping("/student/payments")
        public ResponseEntity<List<PaymentResponse>> findMyPayments(
                Authentication authentication
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.findMyPayments(student)
        );
        }

        @GetMapping("/admin/payments")
        public ResponseEntity<List<PaymentResponse>> findAll() {
                return ResponseEntity.ok(
                        paymentService.findAll()
                );
        }

        @GetMapping("/admin/payments/{paymentId}/transactions")
        public ResponseEntity<List<PaymentTransactionResponse>> findTransactions(
                @PathVariable Long paymentId
        ) {
                return ResponseEntity.ok(
                        paymentService.findTransactions(paymentId)
                );
        }
}
