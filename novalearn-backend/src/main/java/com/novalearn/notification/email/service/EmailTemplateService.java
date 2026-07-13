package com.novalearn.notification.email.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.certificate.dto.CertificateResponse;
import com.novalearn.payment.entity.Payment;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String welcomeSubject() {
        return "Bienvenido a NovaLearn";
    }

    public String welcomeHtml(User user) {
        return """
                <h1>Bienvenido a NovaLearn</h1>
                <p>Hola %s, tu cuenta fue creada correctamente.</p>
                <p>Ya puedes iniciar sesion y explorar nuestros cursos.</p>
                """.formatted(user.getFirstName());
    }

    public String loginOtpSubject() {
        return "Codigo de acceso a NovaLearn";
    }

    public String loginOtpHtml(
            User user,
            String code,
            long expiresInMinutes
    ) {
        return """
                <h1>Codigo de acceso</h1>
                <p>Hola %s, usa este codigo para ingresar a NovaLearn:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px;">%s</p>
                <p>Este codigo vence en %d minutos.</p>
                <p>Si no intentaste iniciar sesion, puedes ignorar este correo.</p>
                """.formatted(
                user.getFirstName(),
                code,
                expiresInMinutes
        );
    }

    public String passwordResetSubject() {
        return "Recupera tu contraseña de NovaLearn";
    }

    public String passwordResetHtml(
            User user,
            String code,
            long expiresInMinutes
    ) {
        return """
                <h1>Recuperación de contraseña</h1>
                <p>Hola %s, usa este código para crear una nueva contraseña:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px;">%s</p>
                <p>Este código vence en %d minutos.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                """.formatted(
                user.getFirstName(),
                code,
                expiresInMinutes
        );
    }

    public String emailChangeSubject() {
        return "Confirma tu nuevo correo en NovaLearn";
    }

    public String emailChangeHtml(
            User user,
            String code,
            long expiresInMinutes
    ) {
        return """
                <h1>Confirmación de correo</h1>
                <p>Hola %s, usa este código para confirmar tu nuevo correo en NovaLearn:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px;">%s</p>
                <p>Este código vence en %d minutos.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                """.formatted(
                user.getFirstName(),
                code,
                expiresInMinutes
        );
    }

    public String paymentSubject() {
        return "Compra confirmada en NovaLearn";
    }

    public String paymentHtml(Payment payment) {
        return """
                <h1>Compra confirmada</h1>
                <p>Hola %s, tu pago fue confirmado correctamente.</p>
                <p><strong>Curso:</strong> %s</p>
                <p><strong>Monto:</strong> %s %s</p>
                <p>Ya tienes acceso al curso en tu cuenta.</p>
                """.formatted(
                payment.getStudent().getFirstName(),
                payment.getCourse().getTitle(),
                payment.getCurrency(),
                payment.getAmount()
        );
    }

    public String certificateSubject() {
        return "Tu certificado NovaLearn esta listo";
    }

    public String certificateHtml(CertificateResponse certificate) {
        return """
                <h1>Certificado generado</h1>
                <p>Felicitaciones, completaste el curso:</p>
                <p><strong>%s</strong></p>
                <p>Codigo de certificado: <strong>%s</strong></p>
                <p>Puedes validarlo desde la plataforma NovaLearn.</p>
                """.formatted(
                certificate.getCourseTitle(),
                certificate.getCertificateCode()
        );
    }
}
