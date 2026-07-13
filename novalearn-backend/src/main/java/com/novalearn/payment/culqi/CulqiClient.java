package com.novalearn.payment.culqi;

import com.novalearn.config.culqi.CulqiProperties;
import com.novalearn.payment.entity.Payment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Component
public class CulqiClient {

    private static final Logger logger =
            LoggerFactory.getLogger(CulqiClient.class);

    private static final String SUCCESS_OUTCOME =
            "venta_exitosa";

    private final CulqiProperties properties;
    private final RestClient.Builder restClientBuilder;

    public CulqiClient(
            CulqiProperties properties,
            RestClient.Builder restClientBuilder
    ) {
        this.properties = properties;
        this.restClientBuilder = restClientBuilder;
    }

    public CulqiChargeVerification verifyCharge(
            Payment payment,
            String providerPaymentId
    ) {
        validateConfiguration();

        CulqiChargeResponse response = fetchCharge(
                providerPaymentId
        );

        validateChargeIdentity(
                response,
                providerPaymentId
        );

        validateAmount(payment, response);
        validateCurrency(payment, response);

        boolean paid = Boolean.TRUE.equals(
                response.getPaid()
        ) || SUCCESS_OUTCOME.equalsIgnoreCase(
                response.getOutcomeType()
        );

        return new CulqiChargeVerification(
                paid,
                response.getId(),
                response.getOutcomeType()
        );
    }

    public CulqiChargeVerification createCharge(
            Payment payment,
            String sourceId,
            String email
    ) {
        validateConfiguration();

        CulqiChargeResponse response = postCharge(
                payment,
                sourceId,
                email
        );

        validateAmount(payment, response);
        validateCurrency(payment, response);

        boolean paid = Boolean.TRUE.equals(
                response.getPaid()
        ) || SUCCESS_OUTCOME.equalsIgnoreCase(
                response.getOutcomeType()
        );

        return new CulqiChargeVerification(
                paid,
                response.getId(),
                response.getOutcomeType()
        );
    }

    public CulqiOrderVerification createOrder(Payment payment) {
        validateConfiguration();

        CulqiOrderResponse response = postOrder(payment);

        validateOrderAmount(payment, response);
        validateOrderCurrency(payment, response);

        return new CulqiOrderVerification(
                isOrderPaid(response),
                isOrderReusable(response),
                response.getId(),
                orderStatus(response),
                response.getExpirationDate()
        );
    }

    public CulqiOrderVerification verifyOrder(
            Payment payment,
            String providerOrderId
    ) {
        validateConfiguration();

        CulqiOrderResponse response = fetchOrder(providerOrderId);

        validateOrderIdentity(response, providerOrderId);
        validateOrderAmount(payment, response);
        validateOrderCurrency(payment, response);

        return new CulqiOrderVerification(
                isOrderPaid(response),
                isOrderReusable(response),
                response.getId(),
                orderStatus(response),
                response.getExpirationDate()
        );
    }

    private CulqiChargeResponse postCharge(
            Payment payment,
            String sourceId,
            String email
    ) {
        try {
            CulqiChargeResponse response =
                    restClientBuilder
                            .baseUrl(
                                    properties.getApiBaseUrl()
                            )
                            .defaultHeader(
                                    "Authorization",
                                    "Bearer " +
                                            properties.getSecretKey()
                            )
                            .build()
                            .post()
                            .uri("/charges")
                            .body(Map.of(
                                    "amount",
                                    toCents(payment),
                                    "currency_code",
                                    payment.getCurrency(),
                                    "email",
                                    email,
                                    "source_id",
                                    sourceId
                            ))
                            .retrieve()
                            .body(CulqiChargeResponse.class);

            if (response == null) {
                throw new IllegalArgumentException(
                        "Culqi no devolvio informacion del cargo"
                );
            }

            return response;
        } catch (RestClientException exception) {
            throw new IllegalArgumentException(
                    "No se pudo crear el cargo con Culqi",
                    exception
            );
        }
    }

    private CulqiChargeResponse fetchCharge(
            String providerPaymentId
    ) {
        try {
            CulqiChargeResponse response =
                    restClientBuilder
                            .baseUrl(
                                    properties.getApiBaseUrl()
                            )
                            .defaultHeader(
                                    "Authorization",
                                    "Bearer " +
                                            properties.getSecretKey()
                            )
                            .build()
                            .get()
                            .uri(
                                    "/charges/{chargeId}",
                                    providerPaymentId
                            )
                            .retrieve()
                            .body(CulqiChargeResponse.class);

            if (response == null) {
                throw new IllegalArgumentException(
                        "Culqi no devolvio informacion del cargo"
                );
            }

            return response;
        } catch (RestClientException exception) {
            throw new IllegalArgumentException(
                    "No se pudo verificar el pago con Culqi",
                    exception
            );
        }
    }

    private CulqiOrderResponse postOrder(Payment payment) {
        try {
            long expirationDate = Instant.now()
                    .plus(1, ChronoUnit.DAYS)
                    .getEpochSecond();

            CulqiOrderResponse response =
                    restClientBuilder
                            .baseUrl(
                                    properties.getApiBaseUrl()
                            )
                            .defaultHeader(
                                    "Authorization",
                                    "Bearer " +
                                            properties.getSecretKey()
                            )
                            .build()
                            .post()
                            .uri("/orders")
                            .body(Map.of(
                                    "amount",
                                    toCents(payment),
                                    "currency_code",
                                    payment.getCurrency(),
                                    "confirm",
                                    false,
                                    "description",
                                    payment.getCourse().getTitle(),
                                    "order_number",
                                    "NL-" + payment.getId() + "-" +
                                            Instant.now().getEpochSecond(),
                                    "expiration_date",
                                    expirationDate,
                                    "client_details",
                                    Map.of(
                                            "first_name",
                                            nonBlankOrDefault(
                                                    payment.getStudent().getFirstName(),
                                                    "NovaLearn"
                                            ),
                                            "last_name",
                                            nonBlankOrDefault(
                                                    payment.getStudent().getLastName(),
                                                    "Student"
                                            ),
                                            "email",
                                            payment.getStudent().getEmail(),
                                            "phone_number",
                                            normalizedPhoneNumber()
                                    )
                            ))
                            .retrieve()
                            .body(CulqiOrderResponse.class);

            if (response == null) {
                throw new IllegalArgumentException(
                        "Culqi no devolvio informacion de la orden"
                );
            }

            logger.info(
                    "Culqi order created. paymentId={}, orderId={}, localStatus=PENDING, culqiStatus={}, expirationDate={}, createdAt={}",
                    payment.getId(),
                    response.getId(),
                    orderStatus(response),
                    response.getExpirationDate(),
                    Instant.now()
            );

            return response;
        } catch (RestClientResponseException exception) {
            throw new IllegalArgumentException(
                    "No se pudo crear la orden con Culqi: " +
                            exception.getResponseBodyAsString(),
                    exception
            );
        } catch (RestClientException exception) {
            throw new IllegalArgumentException(
                    "No se pudo crear la orden con Culqi",
                    exception
            );
        }
    }

    private CulqiOrderResponse fetchOrder(String providerOrderId) {
        try {
            CulqiOrderResponse response =
                    restClientBuilder
                            .baseUrl(
                                    properties.getApiBaseUrl()
                            )
                            .defaultHeader(
                                    "Authorization",
                                    "Bearer " +
                                            properties.getSecretKey()
                            )
                            .build()
                            .get()
                            .uri(
                                    "/orders/{orderId}",
                                    providerOrderId
                            )
                            .retrieve()
                            .body(CulqiOrderResponse.class);

            if (response == null) {
                throw new IllegalArgumentException(
                        "Culqi no devolvio informacion de la orden"
                );
            }

            return response;
        } catch (RestClientException exception) {
            throw new IllegalArgumentException(
                    "No se pudo verificar la orden con Culqi",
                    exception
            );
        }
    }

    private void validateConfiguration() {
        if (
                properties.getApiBaseUrl() == null ||
                properties.getApiBaseUrl().isBlank()
        ) {
            throw new IllegalStateException(
                    "La URL de Culqi no esta configurada"
            );
        }

        if (
                properties.getSecretKey() == null ||
                properties.getSecretKey().isBlank()
        ) {
            throw new IllegalStateException(
                    "La clave secreta de Culqi no esta configurada"
            );
        }
    }

    private void validateChargeIdentity(
            CulqiChargeResponse response,
            String providerPaymentId
    ) {
        if (!providerPaymentId.equals(response.getId())) {
            throw new IllegalArgumentException(
                    "El cargo de Culqi no coincide con el pago solicitado"
            );
        }
    }

    private void validateAmount(
            Payment payment,
            CulqiChargeResponse response
    ) {
        Integer amount = response.getAmount();

        if (amount == null) {
            throw new IllegalArgumentException(
                    "Culqi no devolvio el monto del cargo"
            );
        }

        BigDecimal expectedAmountInCents =
                BigDecimal.valueOf(toCents(payment));

        if (
                expectedAmountInCents.compareTo(
                        BigDecimal.valueOf(amount)
                ) != 0
        ) {
            throw new IllegalArgumentException(
                    "El monto confirmado por Culqi no coincide"
            );
        }
    }

    private void validateCurrency(
            Payment payment,
            CulqiChargeResponse response
    ) {
        if (
                response.getCurrencyCode() == null ||
                !payment.getCurrency().equalsIgnoreCase(
                        response.getCurrencyCode()
                )
        ) {
            throw new IllegalArgumentException(
                    "La moneda confirmada por Culqi no coincide"
            );
        }
    }

    private void validateOrderIdentity(
            CulqiOrderResponse response,
            String providerOrderId
    ) {
        if (!providerOrderId.equals(response.getId())) {
            throw new IllegalArgumentException(
                    "La orden de Culqi no coincide con el pago solicitado"
            );
        }
    }

    private void validateOrderAmount(
            Payment payment,
            CulqiOrderResponse response
    ) {
        Integer amount = response.getAmount();

        if (amount == null) {
            throw new IllegalArgumentException(
                    "Culqi no devolvio el monto de la orden"
            );
        }

        BigDecimal expectedAmountInCents =
                BigDecimal.valueOf(toCents(payment));

        if (
                expectedAmountInCents.compareTo(
                        BigDecimal.valueOf(amount)
                ) != 0
        ) {
            throw new IllegalArgumentException(
                    "El monto confirmado por Culqi no coincide"
            );
        }
    }

    private void validateOrderCurrency(
            Payment payment,
            CulqiOrderResponse response
    ) {
        if (
                response.getCurrencyCode() == null ||
                !payment.getCurrency().equalsIgnoreCase(
                        response.getCurrencyCode()
                )
        ) {
            throw new IllegalArgumentException(
                    "La moneda confirmada por Culqi no coincide"
            );
        }
    }

    private boolean isOrderPaid(CulqiOrderResponse response) {
        String status = orderStatus(response);

        return "paid".equalsIgnoreCase(status) ||
                "pagado".equalsIgnoreCase(status) ||
                "completed".equalsIgnoreCase(status);
    }

    private boolean isOrderReusable(CulqiOrderResponse response) {
        String status = orderStatus(response);

        if (isExpired(response.getExpirationDate())) {
            return false;
        }

        if (status == null || status.isBlank()) {
            return false;
        }

        return "created".equalsIgnoreCase(status) ||
                "creacion".equalsIgnoreCase(status) ||
                "creación".equalsIgnoreCase(status);
    }

    private String orderStatus(CulqiOrderResponse response) {
        if (response.getState() != null) {
            return response.getState();
        }

        return response.getStatus();
    }

    private boolean isExpired(Long expirationEpochSeconds) {
        return expirationEpochSeconds != null &&
                expirationEpochSeconds <= Instant.now().getEpochSecond();
    }

    private String nonBlankOrDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value;
    }

    private String normalizedPhoneNumber() {
        String phoneNumber = properties.getPhoneNumber();

        if (phoneNumber == null || phoneNumber.isBlank()) {
            return "999999999";
        }

        return phoneNumber.replaceAll("\\D", "");
    }

    private int toCents(Payment payment) {
        return payment.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}
