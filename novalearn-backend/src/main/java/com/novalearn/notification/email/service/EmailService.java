package com.novalearn.notification.email.service;

import com.novalearn.config.resend.ResendProperties;
import com.novalearn.notification.email.dto.EmailResponse;
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
                throw new IllegalArgumentException(
                        "No se pudo enviar el correo. Resend respondio: " + response.body()
                );
            }

            return new EmailResponse(
                    extractId(response.body()),
                    "Correo enviado correctamente"
            );

        } catch (IOException e) {
            throw new IllegalArgumentException("Error de conexion al enviar correo");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Envio de correo interrumpido");
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