package com.novalearn.payment.culqi;

import com.novalearn.config.culqi.CulqiProperties;
import com.novalearn.payment.entity.Payment;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Component
public class CulqiClient {

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

    private int toCents(Payment payment) {
        return payment.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}
