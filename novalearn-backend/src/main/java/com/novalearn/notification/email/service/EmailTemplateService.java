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