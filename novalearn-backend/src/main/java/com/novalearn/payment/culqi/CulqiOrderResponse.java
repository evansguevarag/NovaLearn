package com.novalearn.payment.culqi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CulqiOrderResponse {

    private String id;
    private Integer amount;
    private String state;
    private String status;

    @JsonProperty("expiration_date")
    private Long expirationDate;

    @JsonProperty("currency_code")
    private String currencyCode;

    public String getId() {
        return id;
    }

    public Integer getAmount() {
        return amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getState() {
        return state;
    }

    public String getStatus() {
        return status;
    }

    public Long getExpirationDate() {
        return expirationDate;
    }
}
