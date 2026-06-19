package com.novalearn.payment.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.enrollment.dto.EnrollmentRequest;
import com.novalearn.learning.enrollment.repository.EnrollmentRepository;
import com.novalearn.learning.enrollment.service.EnrollmentService;
import com.novalearn.payment.dto.ConfirmPaymentRequest;
import com.novalearn.payment.dto.CreatePaymentRequest;
import com.novalearn.payment.dto.PaymentResponse;
import com.novalearn.payment.dto.PaymentTransactionResponse;
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

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final UserNotificationService userNotificationService;
    private final AuditLogService auditLogService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentTransactionRepository transactionRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            EnrollmentService enrollmentService,
            EmailService emailService,
            EmailTemplateService emailTemplateService,
            UserNotificationService userNotificationService,
            AuditLogService auditLogService
    ) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.enrollmentService = enrollmentService;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
        this.userNotificationService = userNotificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public PaymentResponse createPayment(User student, CreatePaymentRequest request) {

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden comprar cursos");
        }

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (enrollmentRepository.existsByStudentIdAndCourseIdAndDeletedAtIsNull(
                student.getId(),
                course.getId()
        )) {
            throw new IllegalArgumentException("El estudiante ya esta matriculado en este curso");
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setCourse(course);
        payment.setAmount(course.getPrice());
        payment.setCurrency("PEN");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(PaymentProvider.CULQI);

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
    public PaymentResponse confirmPayment(User student, ConfirmPaymentRequest request, HttpServletRequest httpRequest) {

        Payment payment = paymentRepository.findByIdAndStudentId(
                        request.getPaymentId(),
                        student.getId()
                )
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentResponse(payment);
        }

        boolean success = Boolean.TRUE.equals(request.getSuccess());

        if (!success) {
            payment.markAsFailed(request.getProviderPaymentId());

            registerTransaction(
                    payment,
                    TransactionType.FAILED_PAYMENT,
                    PaymentStatus.FAILED,
                    "Pago rechazado por proveedor"
            );

            return new PaymentResponse(payment);
        }

        payment.markAsPaid(request.getProviderPaymentId());

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
}