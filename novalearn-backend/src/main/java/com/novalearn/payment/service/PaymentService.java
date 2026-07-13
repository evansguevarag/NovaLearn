package com.novalearn.payment.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.core.setting.entity.SystemSetting;
import com.novalearn.core.setting.repository.SystemSettingRepository;
import com.novalearn.config.culqi.CulqiProperties;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.enums.CourseType;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.dto.EnrollmentRequest;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.enrollment.service.EnrollmentService;
import com.novalearn.payment.dto.ConfirmPaymentRequest;
import com.novalearn.payment.dto.CreateCulqiChargeRequest;
import com.novalearn.payment.dto.CreatePaymentRequest;
import com.novalearn.payment.dto.PaymentResponse;
import com.novalearn.payment.dto.PaymentSettingsResponse;
import com.novalearn.payment.dto.PaymentTransactionResponse;
import com.novalearn.payment.dto.ReviewManualPaymentRequest;
import com.novalearn.payment.dto.UpdatePaymentSettingsRequest;
import com.novalearn.media.dto.FileUploadResponse;
import com.novalearn.media.service.CloudinaryService;
import com.novalearn.payment.culqi.CulqiChargeVerification;
import com.novalearn.payment.culqi.CulqiClient;
import com.novalearn.payment.culqi.CulqiOrderVerification;
import com.novalearn.payment.entity.Payment;
import com.novalearn.payment.entity.PaymentTransaction;
import com.novalearn.payment.enums.PaymentProvider;
import com.novalearn.payment.enums.PaymentStatus;
import com.novalearn.payment.enums.TransactionType;
import com.novalearn.payment.repository.PaymentRepository;
import com.novalearn.payment.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.novalearn.notification.email.service.EmailService;
import com.novalearn.notification.email.service.EmailTemplateService;
import com.novalearn.notification.internal.enums.NotificationType;
import com.novalearn.notification.internal.service.UserNotificationService;
import com.novalearn.audit.enums.AuditAction;
import com.novalearn.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger logger =
            LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final UserNotificationService userNotificationService;
    private final AuditLogService auditLogService;
    private final CloudinaryService cloudinaryService;
    private final CulqiClient culqiClient;
    private final CulqiProperties culqiProperties;
    private static final BigDecimal MIN_WALLET_AMOUNT =
            BigDecimal.valueOf(6);
    private static final BigDecimal MAX_WALLET_AMOUNT =
            BigDecimal.valueOf(500);
    private static final BigDecimal DEFAULT_PROCESSING_FEE_PERCENTAGE =
            BigDecimal.valueOf(4.02);

    public PaymentService(
            PaymentRepository paymentRepository,
            SystemSettingRepository systemSettingRepository,
            PaymentTransactionRepository transactionRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            EnrollmentService enrollmentService,
            EmailService emailService,
            EmailTemplateService emailTemplateService,
            UserNotificationService userNotificationService,
            AuditLogService auditLogService,
            CloudinaryService cloudinaryService,
            CulqiClient culqiClient,
            CulqiProperties culqiProperties
    ) {
        this.paymentRepository = paymentRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.transactionRepository = transactionRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentService = enrollmentService;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
        this.userNotificationService = userNotificationService;
        this.auditLogService = auditLogService;
        this.cloudinaryService = cloudinaryService;
        this.culqiClient = culqiClient;
        this.culqiProperties = culqiProperties;
    }

    @Transactional
    public PaymentResponse createPayment(User student, CreatePaymentRequest request) {

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden comprar cursos");
        }

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new IllegalArgumentException("El curso no esta disponible para compra");
        }

        if (course.getCourseType() != CourseType.PAID) {
            throw new IllegalArgumentException("Solo los cursos de pago usan checkout");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                student.getId(),
                course.getId()
        )) {
            throw new IllegalArgumentException("El estudiante ya esta matriculado en este curso");
        }

        PaymentSettings settings = getEffectivePaymentSettings();

        if (!settings.culqiPaymentsEnabled() && !settings.manualPaymentsEnabled()) {
            throw new IllegalArgumentException(
                    "No hay metodos de pago disponibles en este momento"
            );
        }

        PaymentAmountBreakdown breakdown = settings.culqiPaymentsEnabled()
                ? calculatePaymentAmountBreakdown(course.getPrice())
                : calculateManualPaymentAmountBreakdown(course.getPrice());

        Payment existingPendingPayment =
                paymentRepository.findFirstByStudentIdAndCourseIdAndCurrencyAndAmountAndStatusOrderByCreatedAtDesc(
                                student.getId(),
                                course.getId(),
                                "PEN",
                                breakdown.totalAmount(),
                                PaymentStatus.PENDING
                        )
                        .orElse(null);

        if (existingPendingPayment != null) {
            return new PaymentResponse(existingPendingPayment);
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setCourse(course);
        payment.setSubtotalAmount(breakdown.subtotalAmount());
        payment.setProcessingFeeAmount(breakdown.processingFeeAmount());
        payment.setTaxAmount(breakdown.taxAmount());
        payment.setTotalAmount(breakdown.totalAmount());
        payment.setCurrency("PEN");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(
                settings.culqiPaymentsEnabled()
                        ? PaymentProvider.CULQI
                        : PaymentProvider.MANUAL
        );

        Payment savedPayment = paymentRepository.save(payment);

        try {
            emailService.sendEmail(
                    payment.getStudent().getEmail(),
                    emailTemplateService.paymentSubject(),
                    emailTemplateService.paymentHtml(payment)
            );
        } catch (Exception ignored) {
        }

        registerTransaction(
                savedPayment,
                TransactionType.CREATE_PAYMENT,
                PaymentStatus.PENDING,
                "Pago creado internamente. Pendiente de confirmacion Culqi."
        );
        return new PaymentResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse createManualPayment(
            User student,
            Long courseId,
            String method,
            String reference,
            MultipartFile proofFile
    ) {
        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException(
                    "Solo los estudiantes pueden registrar pagos manuales"
            );
        }

        Course course = courseRepository.findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new IllegalArgumentException("El curso no esta disponible para compra");
        }

        if (course.getCourseType() != CourseType.PAID) {
            throw new IllegalArgumentException("Solo los cursos de pago aceptan comprobantes");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                student.getId(),
                course.getId()
        )) {
            throw new IllegalArgumentException("El estudiante ya esta matriculado en este curso");
        }

        PaymentSettings settings = getEffectivePaymentSettings();

        if (!settings.manualPaymentsEnabled()) {
            throw new IllegalArgumentException(
                    "El pago manual no esta disponible en este momento"
            );
        }

        Payment existingPendingPayment = paymentRepository
                .findFirstByStudentIdAndCourseIdAndProviderAndStatusOrderByCreatedAtDesc(
                        student.getId(),
                        course.getId(),
                        PaymentProvider.MANUAL,
                        PaymentStatus.PENDING
                )
                .orElse(null);

        if (existingPendingPayment != null) {
            if (
                    existingPendingPayment.getManualProofUrl() != null &&
                            !existingPendingPayment.getManualProofUrl().isBlank()
            ) {
                return new PaymentResponse(existingPendingPayment);
            }

            FileUploadResponse uploadResponse = uploadManualProof(proofFile);
            existingPendingPayment.setManualMethod(
                    normalizeManualText(method, "Metodo manual")
            );
            existingPendingPayment.setManualReference(
                    normalizeManualText(reference, null)
            );
            existingPendingPayment.setManualProofUrl(uploadResponse.getUrl());
            existingPendingPayment.setManualProofPublicId(
                    uploadResponse.getPublicId()
            );
            existingPendingPayment.setManualProofResourceType(
                    uploadResponse.getResourceType()
            );

            registerTransaction(
                    existingPendingPayment,
                    TransactionType.CREATE_PAYMENT,
                    PaymentStatus.PENDING,
                    "Comprobante manual agregado a pago pendiente."
            );

            return new PaymentResponse(existingPendingPayment);
        }

        cancelExistingCulqiPendingPayment(student.getId(), course.getId());

        FileUploadResponse uploadResponse = uploadManualProof(proofFile);
        BigDecimal coursePrice = normalizeMoney(course.getPrice());

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setCourse(course);
        payment.setSubtotalAmount(coursePrice);
        payment.setProcessingFeeAmount(BigDecimal.ZERO);
        payment.setTaxAmount(BigDecimal.ZERO);
        payment.setTotalAmount(coursePrice);
        payment.setCurrency("PEN");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(PaymentProvider.MANUAL);
        payment.setManualMethod(normalizeManualText(method, "Metodo manual"));
        payment.setManualReference(normalizeManualText(reference, null));
        payment.setManualProofUrl(uploadResponse.getUrl());
        payment.setManualProofPublicId(uploadResponse.getPublicId());
        payment.setManualProofResourceType(uploadResponse.getResourceType());

        Payment savedPayment = paymentRepository.save(payment);

        registerTransaction(
                savedPayment,
                TransactionType.CREATE_PAYMENT,
                PaymentStatus.PENDING,
                "Comprobante manual registrado. Pendiente de revision administrativa."
        );

        userNotificationService.createSystemNotification(
                payment.getStudent(),
                "Comprobante recibido",
                "Tu comprobante para el curso " + payment.getCourse().getTitle() + " fue recibido y esta en revision.",
                NotificationType.PAYMENT
        );

        return new PaymentResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse approveManualPayment(
            User admin,
            Long paymentId,
            HttpServletRequest httpRequest
    ) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        validateManualPaymentReview(payment);

        payment.setManualReviewedBy(admin);
        payment.setManualReviewedAt(LocalDateTime.now());
        payment.setManualRejectionReason(null);
        payment.markAsPaid(
                payment.getManualReference() != null
                        ? payment.getManualReference()
                        : "MANUAL-" + payment.getId()
        );

        confirmPaidPayment(
                payment,
                "Pago manual aprobado por administracion",
                httpRequest
        );

        return new PaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse rejectManualPayment(
            User admin,
            Long paymentId,
            ReviewManualPaymentRequest request
    ) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        validateManualPaymentReview(payment);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException(
                    "No se puede rechazar un pago ya aprobado"
            );
        }

        String reason = normalizeManualText(
                request != null ? request.getReason() : null,
                "El comprobante no pudo ser validado."
        );

        payment.markAsRejected(admin, reason);

        registerTransaction(
                payment,
                TransactionType.FAILED_PAYMENT,
                PaymentStatus.REJECTED,
                "Pago manual rechazado: " + reason
        );

        userNotificationService.createSystemNotification(
                payment.getStudent(),
                "Comprobante rechazado",
                "Tu comprobante para el curso " + payment.getCourse().getTitle() + " fue rechazado. " + reason,
                NotificationType.PAYMENT
        );

        return new PaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmPayment(User student, ConfirmPaymentRequest request, HttpServletRequest httpRequest) {

        Payment payment = paymentRepository.findByIdAndStudentId(
                        request.getPaymentId(),
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        CulqiChargeVerification verification =
                culqiClient.verifyCharge(
                        payment,
                        request.getProviderPaymentId()
                );

        if (!verification.isPaid()) {
            payment.markAsFailed(
                    verification.getProviderPaymentId()
            );

            registerTransaction(
                    payment,
                    TransactionType.FAILED_PAYMENT,
                    PaymentStatus.FAILED,
                    "Pago no aprobado por Culqi. Estado: " +
                            verification.getRawStatus()
            );

            return new PaymentResponse(payment);
        }

        payment.markAsPaid(
                verification.getProviderPaymentId()
        );

        auditLogService.register(
        payment.getStudent(),
        AuditAction.PAYMENT_CONFIRMED,
        "Payment",
        String.valueOf(payment.getId()),
        "Pago confirmado para el curso " + payment.getCourse().getTitle(),
        httpRequest
        );

        registerTransaction(
                payment,
                TransactionType.CONFIRM_PAYMENT,
                PaymentStatus.PAID,
                "Pago confirmado correctamente"
        );

        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                payment.getStudent().getId(),
                payment.getCourse().getId()
        )) {
            EnrollmentRequest enrollmentRequest = new EnrollmentRequest(
                    payment.getStudent().getId(),
                    payment.getCourse().getId()
            );

            enrollmentService.create(enrollmentRequest);

            userNotificationService.createSystemNotification(
            payment.getStudent(),
            "Pago confirmado",
            "Tu compra del curso " + payment.getCourse().getTitle() + " fue confirmada correctamente.",
            NotificationType.PAYMENT
            );

        }

        return new PaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentSettingsResponse getPaymentSettings() {
        PaymentSettings settings = getEffectivePaymentSettings();

        return new PaymentSettingsResponse(
                settings.processingFeePercentage(),
                settings.processingFeeTaxPercentage(),
                settings.passProcessingFeeToStudent(),
                settings.culqiPaymentsEnabled(),
                settings.manualPaymentsEnabled()
        );
    }

    @Transactional
    public PaymentSettingsResponse updatePaymentSettings(
            UpdatePaymentSettingsRequest request
    ) {
        if (!request.isCulqiPaymentsEnabled() && !request.isManualPaymentsEnabled()) {
            throw new IllegalArgumentException(
                    "Debe quedar activo al menos un metodo de pago"
            );
        }

        SystemSetting setting = systemSettingRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(SystemSetting::new);

        setting.setPaymentProcessingFeePercentage(
                normalizeMoney(request.getProcessingFeePercentage())
        );
        setting.setPaymentProcessingFeeTaxPercentage(BigDecimal.ZERO);
        setting.setPassProcessingFeeToStudent(
                request.isPassProcessingFeeToStudent()
        );
        setting.setCulqiPaymentsEnabled(
                request.isCulqiPaymentsEnabled()
        );
        setting.setManualPaymentsEnabled(
                request.isManualPaymentsEnabled()
        );

        systemSettingRepository.save(setting);

        return new PaymentSettingsResponse(
                setting.getPaymentProcessingFeePercentage(),
                setting.getPaymentProcessingFeeTaxPercentage(),
                setting.isPassProcessingFeeToStudent(),
                setting.isCulqiPaymentsEnabled(),
                setting.isManualPaymentsEnabled()
        );
    }

    @Transactional
    public PaymentResponse createCulqiCharge(
            User student,
            Long paymentId,
            CreateCulqiChargeRequest request,
            HttpServletRequest httpRequest
    ) {
        ensureCulqiPaymentsEnabled();

        Payment payment = paymentRepository.findByIdAndStudentId(
                        paymentId,
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Solo se pueden procesar pagos pendientes"
            );
        }

        CulqiChargeVerification verification =
                culqiClient.createCharge(
                        payment,
                        request.getSourceId(),
                        student.getEmail()
                );

        if (!verification.isPaid()) {
            payment.markAsFailed(
                    verification.getProviderPaymentId()
            );

            registerTransaction(
                    payment,
                    TransactionType.FAILED_PAYMENT,
                    PaymentStatus.FAILED,
                    "Cargo no aprobado por Culqi. Estado: " +
                            verification.getRawStatus()
            );

            return new PaymentResponse(payment);
        }

        payment.markAsPaid(
                verification.getProviderPaymentId()
        );

        auditLogService.register(
                payment.getStudent(),
                AuditAction.PAYMENT_CONFIRMED,
                "Payment",
                String.valueOf(payment.getId()),
                "Pago confirmado para el curso " + payment.getCourse().getTitle(),
                httpRequest
        );

        registerTransaction(
                payment,
                TransactionType.CONFIRM_PAYMENT,
                PaymentStatus.PAID,
                "Cargo creado y confirmado por Culqi"
        );

        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                payment.getStudent().getId(),
                payment.getCourse().getId()
        )) {
            EnrollmentRequest enrollmentRequest = new EnrollmentRequest(
                    payment.getStudent().getId(),
                    payment.getCourse().getId()
            );

            enrollmentService.create(enrollmentRequest);

            userNotificationService.createSystemNotification(
                    payment.getStudent(),
                    "Pago confirmado",
                    "Tu compra del curso " + payment.getCourse().getTitle() + " fue confirmada correctamente.",
                    NotificationType.PAYMENT
            );
        }

        return new PaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse createCulqiOrder(
            User student,
            Long paymentId
    ) {
        ensureCulqiPaymentsEnabled();

        Payment payment = paymentRepository.findByIdAndStudentIdForUpdate(
                        paymentId,
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Solo se pueden procesar pagos pendientes"
            );
        }

        validateWalletAmount(payment);

        logger.info(
                "Preparing Culqi order. paymentId={}, localOrderId={}, localOrderStatus={}, localExpiresAt={}, requestedAt={}",
                payment.getId(),
                payment.getProviderOrderId(),
                payment.getProviderOrderStatus(),
                payment.getProviderOrderExpiresAt(),
                LocalDateTime.now()
        );

        if (
                payment.getProviderOrderId() != null &&
                        !payment.getProviderOrderId().isBlank()
        ) {
            CulqiOrderVerification existingOrder =
                    verifyExistingOrder(payment);

            updateOrderMetadata(payment, existingOrder);

            logger.info(
                    "Culqi order verified before checkout. paymentId={}, orderId={}, localStatus={}, culqiStatus={}, expiresAt={}, verifiedAt={}",
                    payment.getId(),
                    existingOrder.getProviderOrderId(),
                    payment.getProviderOrderStatus(),
                    existingOrder.getRawStatus(),
                    payment.getProviderOrderExpiresAt(),
                    LocalDateTime.now()
            );

            if (existingOrder.isPaid()) {
                payment.markAsPaidByOrder(
                        existingOrder.getProviderOrderId()
                );

                confirmPaidPayment(
                        payment,
                        "Orden Culqi pagada antes de reabrir checkout",
                        null
                );

                return new PaymentResponse(payment);
            }

            if (existingOrder.isReusable()) {
                registerTransaction(
                        payment,
                        TransactionType.CREATE_ORDER,
                        PaymentStatus.PENDING,
                        "Orden Culqi reutilizada. Estado: " +
                                existingOrder.getRawStatus()
                );

                return new PaymentResponse(payment);
            }
        }

        return createNewCulqiOrder(payment);
    }

    @Transactional
    public PaymentResponse confirmCulqiOrder(
            User student,
            Long paymentId,
            HttpServletRequest httpRequest
    ) {
        ensureCulqiPaymentsEnabled();

        Payment payment = paymentRepository.findByIdAndStudentId(
                        paymentId,
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        if (
                payment.getProviderOrderId() == null ||
                        payment.getProviderOrderId().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El pago no tiene una orden Culqi asociada"
            );
        }

        CulqiOrderVerification verification =
                culqiClient.verifyOrder(
                        payment,
                        payment.getProviderOrderId()
                );

        updateOrderMetadata(payment, verification);

        logger.info(
                "Confirming Culqi order. paymentId={}, orderId={}, localStatus={}, culqiStatus={}, expiresAt={}, confirmedAt={}",
                payment.getId(),
                verification.getProviderOrderId(),
                payment.getProviderOrderStatus(),
                verification.getRawStatus(),
                payment.getProviderOrderExpiresAt(),
                LocalDateTime.now()
        );

        if (!verification.isPaid()) {
            registerTransaction(
                    payment,
                    TransactionType.CONFIRM_PAYMENT,
                    PaymentStatus.PENDING,
                    "Orden Culqi aun no pagada. Estado: " +
                            verification.getRawStatus()
            );

            return new PaymentResponse(payment);
        }

        payment.markAsPaidByOrder(
                verification.getProviderOrderId()
        );

        confirmPaidPayment(
                payment,
                "Orden Culqi pagada y confirmada",
                httpRequest
        );

        return new PaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse cancelPendingPayment(
            User student,
            Long paymentId
    ) {
        Payment payment = paymentRepository.findByIdAndStudentIdForUpdate(
                        paymentId,
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new PaymentResponse(payment);
        }

        payment.markAsCancelled();

        registerTransaction(
                payment,
                TransactionType.CANCEL_PAYMENT,
                PaymentStatus.CANCELLED,
                "Pago cancelado por el estudiante antes de completar checkout."
        );

        return new PaymentResponse(payment);
    }

    @Transactional
    public void handleCulqiOrderWebhook(String providerOrderId) {
        if (providerOrderId == null || providerOrderId.isBlank()) {
            return;
        }

        Payment payment = paymentRepository.findByProviderOrderId(
                        providerOrderId
                )
                .orElse(null);

        if (payment == null || payment.getStatus() == PaymentStatus.PAID) {
            return;
        }

        CulqiOrderVerification verification =
                culqiClient.verifyOrder(
                        payment,
                        providerOrderId
                );

        updateOrderMetadata(payment, verification);

        if (!verification.isPaid()) {
            registerTransaction(
                    payment,
                    TransactionType.CONFIRM_PAYMENT,
                    PaymentStatus.PENDING,
                    "Webhook Culqi recibido. Orden aun no pagada. Estado: " +
                            verification.getRawStatus()
            );

            return;
        }

        payment.markAsPaidByOrder(
                verification.getProviderOrderId()
        );

        confirmPaidPayment(
                payment,
                "Orden Culqi confirmada por webhook",
                null
        );
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findMyPayments(User student) {
        return paymentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(PaymentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PaymentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findManualPayments(PaymentStatus status) {
        List<Payment> payments = status != null
                ? paymentRepository.findByProviderAndStatusOrderByCreatedAtDesc(
                        PaymentProvider.MANUAL,
                        status
                )
                : paymentRepository.findByProviderOrderByCreatedAtDesc(
                        PaymentProvider.MANUAL
                );

        return payments.stream()
                .map(PaymentResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> findTransactions(Long paymentId) {
        return transactionRepository.findByPaymentIdOrderByCreatedAtDesc(paymentId)
                .stream()
                .map(PaymentTransactionResponse::new)
                .toList();
    }

    private void registerTransaction(
            Payment payment,
            TransactionType transactionType,
            PaymentStatus status,
            String providerResponse
    ) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(payment);
        transaction.setTransactionType(transactionType);
        transaction.setStatus(status);
        transaction.setProviderResponse(providerResponse);

        transactionRepository.save(transaction);
    }

    private void validateWalletAmount(Payment payment) {
        if (
                payment.getTotalAmount().compareTo(MIN_WALLET_AMOUNT) < 0 ||
                        payment.getTotalAmount().compareTo(MAX_WALLET_AMOUNT) > 0
        ) {
            throw new IllegalArgumentException(
                    "Las billeteras moviles aceptan montos entre S/ 6 y S/ 500"
            );
        }
    }

    private void ensureCulqiPaymentsEnabled() {
        if (!getEffectivePaymentSettings().culqiPaymentsEnabled()) {
            throw new IllegalArgumentException(
                    "Culqi no esta disponible en este momento"
            );
        }
    }

    private void cancelExistingCulqiPendingPayment(
            Long studentId,
            Long courseId
    ) {
        Payment existingPayment = paymentRepository
                .findFirstByStudentIdAndCourseIdAndStatusOrderByCreatedAtDesc(
                        studentId,
                        courseId,
                        PaymentStatus.PENDING
                )
                .orElse(null);

        if (
                existingPayment == null ||
                        existingPayment.getProvider() != PaymentProvider.CULQI
        ) {
            return;
        }

        existingPayment.markAsCancelled();

        registerTransaction(
                existingPayment,
                TransactionType.CANCEL_PAYMENT,
                PaymentStatus.CANCELLED,
                "Pago Culqi pendiente cancelado al registrar comprobante manual."
        );
    }

    private void validateManualPaymentReview(Payment payment) {
        if (payment.getProvider() != PaymentProvider.MANUAL) {
            throw new IllegalArgumentException(
                    "Solo se pueden revisar pagos manuales"
            );
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Solo se pueden revisar pagos manuales pendientes"
            );
        }

        if (
                payment.getManualProofUrl() == null ||
                        payment.getManualProofUrl().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El pago manual no tiene comprobante asociado"
            );
        }
    }

    private FileUploadResponse uploadManualProof(MultipartFile proofFile) {
        if (proofFile == null || proofFile.isEmpty()) {
            throw new IllegalArgumentException("El comprobante es obligatorio");
        }

        String contentType = proofFile.getContentType();

        if (
                contentType != null &&
                        contentType.equalsIgnoreCase("application/pdf")
        ) {
            return cloudinaryService.uploadPdf(proofFile);
        }

        return cloudinaryService.uploadImage(proofFile);
    }

    private String normalizeManualText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
    }

    private CulqiOrderVerification verifyExistingOrder(Payment payment) {
        try {
            return culqiClient.verifyOrder(
                    payment,
                    payment.getProviderOrderId()
            );
        } catch (IllegalArgumentException exception) {
            registerTransaction(
                    payment,
                    TransactionType.CREATE_ORDER,
                    PaymentStatus.PENDING,
                    "Orden Culqi anterior no reutilizable: " +
                            exception.getMessage()
            );

            return new CulqiOrderVerification(
                    false,
                    false,
                    payment.getProviderOrderId(),
                    "INVALID",
                    null
            );
        }
    }

    private PaymentResponse createNewCulqiOrder(Payment payment) {
        CulqiOrderVerification verification =
                culqiClient.createOrder(payment);

        updateOrderMetadata(payment, verification);

        logger.info(
                "New Culqi order stored. paymentId={}, orderId={}, localStatus={}, culqiStatus={}, expiresAt={}, storedAt={}",
                payment.getId(),
                verification.getProviderOrderId(),
                payment.getProviderOrderStatus(),
                verification.getRawStatus(),
                payment.getProviderOrderExpiresAt(),
                LocalDateTime.now()
        );

        if (!verification.isReusable()) {
            registerTransaction(
                    payment,
                    TransactionType.CREATE_ORDER,
                    PaymentStatus.PENDING,
                    "Orden Culqi creada en estado no reutilizable para checkout QR. Estado: " +
                            verification.getRawStatus()
            );

            throw new IllegalArgumentException(
                    "Culqi creo la orden en estado no compatible con QR: " +
                            verification.getRawStatus()
            );
        }

        registerTransaction(
                payment,
                TransactionType.CREATE_ORDER,
                PaymentStatus.PENDING,
                "Orden Culqi creada. Estado: " +
                        verification.getRawStatus()
        );

        return new PaymentResponse(payment);
    }

    private void updateOrderMetadata(
            Payment payment,
            CulqiOrderVerification verification
    ) {
        payment.setProviderOrderId(
                verification.getProviderOrderId()
        );
        payment.setProviderOrderStatus(
                verification.getRawStatus()
        );
        payment.setProviderOrderExpiresAt(
                toLocalDateTime(
                        verification.getExpirationEpochSeconds()
                )
        );
    }

    private LocalDateTime toLocalDateTime(
            Long expirationEpochSeconds
    ) {
        if (expirationEpochSeconds == null) {
            return null;
        }

        return LocalDateTime.ofInstant(
                Instant.ofEpochSecond(expirationEpochSeconds),
                ZoneId.systemDefault()
        );
    }

    private void confirmPaidPayment(
            Payment payment,
            String transactionMessage,
            HttpServletRequest httpRequest
    ) {
        auditLogService.register(
                payment.getStudent(),
                AuditAction.PAYMENT_CONFIRMED,
                "Payment",
                String.valueOf(payment.getId()),
                "Pago confirmado para el curso " + payment.getCourse().getTitle(),
                httpRequest
        );

        registerTransaction(
                payment,
                TransactionType.CONFIRM_PAYMENT,
                PaymentStatus.PAID,
                transactionMessage
        );

        if (!enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                payment.getStudent().getId(),
                payment.getCourse().getId()
        )) {
            EnrollmentRequest enrollmentRequest = new EnrollmentRequest(
                    payment.getStudent().getId(),
                    payment.getCourse().getId()
            );

            enrollmentService.create(enrollmentRequest);

            userNotificationService.createSystemNotification(
                    payment.getStudent(),
                    "Pago confirmado",
                    "Tu compra del curso " + payment.getCourse().getTitle() + " fue confirmada correctamente.",
                    NotificationType.PAYMENT
            );
        }
    }

    private PaymentAmountBreakdown calculatePaymentAmountBreakdown(
            BigDecimal coursePrice
    ) {
        BigDecimal subtotal = normalizeMoney(coursePrice);
        PaymentSettings settings = getEffectivePaymentSettings();
        BigDecimal processingFee = calculatePercentageAmount(
                subtotal,
                settings.processingFeePercentage()
        );
        BigDecimal taxAmount = BigDecimal.ZERO.setScale(
                2,
                RoundingMode.HALF_UP
        );

        BigDecimal total = settings.passProcessingFeeToStudent()
                ? subtotal.add(processingFee).add(taxAmount)
                : subtotal;

        return new PaymentAmountBreakdown(
                subtotal,
                processingFee,
                taxAmount,
                normalizeMoney(total)
        );
    }

    private PaymentAmountBreakdown calculateManualPaymentAmountBreakdown(
            BigDecimal coursePrice
    ) {
        BigDecimal subtotal = normalizeMoney(coursePrice);

        return new PaymentAmountBreakdown(
                subtotal,
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                subtotal
        );
    }

    private PaymentSettings getEffectivePaymentSettings() {
        return systemSettingRepository
                .findFirstByOrderByIdAsc()
                .map(setting -> new PaymentSettings(
                        normalizeMoney(
                                setting.getPaymentProcessingFeePercentage()
                        ),
                        BigDecimal.ZERO.setScale(
                                2,
                                RoundingMode.HALF_UP
                        ),
                        setting.isPassProcessingFeeToStudent(),
                        setting.isCulqiPaymentsEnabled(),
                        setting.isManualPaymentsEnabled()
                ))
                .orElseGet(() -> new PaymentSettings(
                        resolveDefaultProcessingFeePercentage(),
                        BigDecimal.ZERO.setScale(
                                2,
                                RoundingMode.HALF_UP
                        ),
                        culqiProperties.isPassProcessingFeeToStudent(),
                        true,
                        true
                ));
    }

    private BigDecimal resolveDefaultProcessingFeePercentage() {
        BigDecimal configuredPercentage =
                normalizeMoney(
                        culqiProperties.getProcessingFeePercentage()
                );

        if (configuredPercentage.compareTo(BigDecimal.ZERO) > 0) {
            return configuredPercentage;
        }

        return DEFAULT_PROCESSING_FEE_PERCENTAGE.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal calculatePercentageAmount(
            BigDecimal amount,
            BigDecimal percentage
    ) {
        if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return normalizeMoney(
                amount.multiply(percentage)
                        .divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record PaymentAmountBreakdown(
            BigDecimal subtotalAmount,
            BigDecimal processingFeeAmount,
            BigDecimal taxAmount,
            BigDecimal totalAmount
    ) {
    }

    private record PaymentSettings(
            BigDecimal processingFeePercentage,
            BigDecimal processingFeeTaxPercentage,
            boolean passProcessingFeeToStudent,
            boolean culqiPaymentsEnabled,
            boolean manualPaymentsEnabled
    ) {
    }
}
