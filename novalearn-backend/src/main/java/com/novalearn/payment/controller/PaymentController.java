package com.novalearn.payment.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.payment.dto.ConfirmPaymentRequest;
import com.novalearn.payment.dto.CreateCulqiChargeRequest;
import com.novalearn.payment.dto.CreatePaymentRequest;
import com.novalearn.payment.dto.PaymentResponse;
import com.novalearn.payment.dto.PaymentSettingsResponse;
import com.novalearn.payment.dto.PaymentTransactionResponse;
import com.novalearn.payment.dto.ReviewManualPaymentRequest;
import com.novalearn.payment.dto.UpdatePaymentSettingsRequest;
import com.novalearn.payment.enums.PaymentStatus;
import com.novalearn.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

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

        @PostMapping(
                value = "/student/payments/manual",
                consumes = "multipart/form-data"
        )
        public ResponseEntity<PaymentResponse> createManualPayment(
                Authentication authentication,
                @RequestParam("courseId") Long courseId,
                @RequestParam("method") String method,
                @RequestParam(value = "reference", required = false) String reference,
                @RequestParam("file") MultipartFile file
        ) {
                User student = (User) authentication.getPrincipal();

                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(paymentService.createManualPayment(
                                student,
                                courseId,
                                method,
                                reference,
                                file
                        ));
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

        @PostMapping("/student/payments/{paymentId}/culqi/charge")
        public ResponseEntity<PaymentResponse> createCulqiCharge(
                Authentication authentication,
                @PathVariable Long paymentId,
                @Valid @RequestBody CreateCulqiChargeRequest request,
                HttpServletRequest httpRequest
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.createCulqiCharge(
                        student,
                        paymentId,
                        request,
                        httpRequest
                )
        );
        }

        @PostMapping("/student/payments/{paymentId}/culqi/order")
        public ResponseEntity<PaymentResponse> createCulqiOrder(
                Authentication authentication,
                @PathVariable Long paymentId
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.createCulqiOrder(
                        student,
                        paymentId
                )
        );
        }

        @PostMapping("/student/payments/{paymentId}/culqi/order/confirm")
        public ResponseEntity<PaymentResponse> confirmCulqiOrder(
                Authentication authentication,
                @PathVariable Long paymentId,
                HttpServletRequest httpRequest
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.confirmCulqiOrder(
                        student,
                        paymentId,
                        httpRequest
                )
        );
        }

        @PostMapping("/student/payments/{paymentId}/cancel")
        public ResponseEntity<PaymentResponse> cancelPendingPayment(
                Authentication authentication,
                @PathVariable Long paymentId
        ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.cancelPendingPayment(
                        student,
                        paymentId
                )
        );
        }

        @PostMapping("/public/culqi/webhooks/order")
        public ResponseEntity<Void> handleCulqiOrderWebhook(
                @RequestBody Map<String, Object> payload
        ) {
        String providerOrderId = extractOrderId(payload);

        paymentService.handleCulqiOrderWebhook(providerOrderId);

        return ResponseEntity.ok().build();
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

        @GetMapping("/student/payments/settings")
        public ResponseEntity<PaymentSettingsResponse> getStudentPaymentSettings() {
                return ResponseEntity.ok(
                        paymentService.getPaymentSettings()
                );
        }

        @GetMapping("/admin/payments")
        public ResponseEntity<List<PaymentResponse>> findAll() {
                return ResponseEntity.ok(
                        paymentService.findAll()
                );
        }

        @GetMapping("/admin/payments/manual")
        public ResponseEntity<List<PaymentResponse>> findManualPayments(
                @RequestParam(value = "status", required = false)
                PaymentStatus status
        ) {
                return ResponseEntity.ok(
                        paymentService.findManualPayments(status)
                );
        }

        @PostMapping("/admin/payments/{paymentId}/manual/approve")
        public ResponseEntity<PaymentResponse> approveManualPayment(
                Authentication authentication,
                @PathVariable Long paymentId,
                HttpServletRequest httpRequest
        ) {
                User admin = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                        paymentService.approveManualPayment(
                                admin,
                                paymentId,
                                httpRequest
                        )
                );
        }

        @PostMapping("/admin/payments/{paymentId}/manual/reject")
        public ResponseEntity<PaymentResponse> rejectManualPayment(
                Authentication authentication,
                @PathVariable Long paymentId,
                @Valid @RequestBody ReviewManualPaymentRequest request
        ) {
                User admin = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                        paymentService.rejectManualPayment(
                                admin,
                                paymentId,
                                request
                        )
                );
        }

        @GetMapping("/admin/payments/settings")
        public ResponseEntity<PaymentSettingsResponse> getPaymentSettings() {
                return ResponseEntity.ok(
                        paymentService.getPaymentSettings()
                );
        }

        @PutMapping("/admin/payments/settings")
        public ResponseEntity<PaymentSettingsResponse> updatePaymentSettings(
                @Valid @RequestBody UpdatePaymentSettingsRequest request
        ) {
                return ResponseEntity.ok(
                        paymentService.updatePaymentSettings(request)
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

        private String extractOrderId(Map<String, Object> payload) {
                Object directId = payload.get("id");

                if (directId instanceof String id && id.startsWith("ord_")) {
                        return id;
                }

                Object orderId = payload.get("order_id");

                if (orderId instanceof String id) {
                        return id;
                }

                Object data = payload.get("data");

                if (data instanceof Map<?, ?> dataMap) {
                        Object dataId = dataMap.get("id");

                        if (dataId instanceof String id && id.startsWith("ord_")) {
                                return id;
                        }

                        Object object = dataMap.get("object");

                        if (object instanceof Map<?, ?> objectMap) {
                                Object objectId = objectMap.get("id");

                                if (objectId instanceof String id) {
                                        return id;
                                }
                        }
                }

                return null;
        }
}
