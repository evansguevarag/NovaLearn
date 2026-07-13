package com.novalearn.notification.email.service;

import com.novalearn.common.exception.EmailDeliveryException;
import com.novalearn.config.resend.ResendProperties;
import com.novalearn.notification.email.dto.EmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final String RESEND_EMAILS_URL = "https://api.resend.com/emails";
    private static final Logger LOGGER =
            LoggerFactory.getLogger(EmailService.class);

    private final ResendProperties properties;
    private final HttpClient httpClient;

    public EmailService(ResendProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newHttpClient();
    }

    public EmailResponse sendEmail(String to, String subject, String html) {
        String json = """
                {
                    "from": "%s",
                    "to": ["%s"],
                    "subject": "%s",
                    "html": "%s"
                }
                """.formatted(
                escapeJson(properties.getFromEmail()),
                escapeJson(to),
                escapeJson(subject),
                escapeJson(html)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(RESEND_EMAILS_URL))
                .header("Authorization", "Bearer " + properties.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                LOGGER.warn(
                        "Resend no pudo enviar el correo. statusCode={}, body={}",
                        response.statusCode(),
                        response.body()
                );
                throw new EmailDeliveryException(
                        "No se pudo enviar el código por correo. Verifica la configuración del proveedor de correo."
                );
            }

            return new EmailResponse(
                    extractId(response.body()),
                    "Correo enviado correctamente"
            );

        } catch (IOException e) {
            LOGGER.warn(
                    "Error de conexión al enviar correo con Resend: {}",
                    e.getMessage()
            );
            throw new EmailDeliveryException(
                    "No se pudo enviar el código por correo. Inténtalo nuevamente."
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new EmailDeliveryException(
                    "El envío del código fue interrumpido. Inténtalo nuevamente."
            );
        }
    }

    private String extractId(String responseBody) {
        String marker = "\"id\":\"";
        int start = responseBody.indexOf(marker);

        if (start == -1) {
            return null;
        }

        start += marker.length();
        int end = responseBody.indexOf("\"", start);

        if (end == -1) {
            return null;
        }

        return responseBody.substring(start, end);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
