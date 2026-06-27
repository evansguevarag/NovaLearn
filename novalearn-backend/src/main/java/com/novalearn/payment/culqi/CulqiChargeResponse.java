package com.novalearn.payment.culqi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CulqiChargeResponse {

    private String id;
    private Boolean paid;
    private Integer amount;

    @JsonProperty("currency_code")
    private String currencyCode;

    private String outcomeType;

    @JsonProperty("outcome")
    private void unpackOutcome(Outcome outcome) {
        if (outcome != null) {
            this.outcomeType = outcome.getType();
        }
    }

    public String getId() {
        return id;
    }

    public Boolean getPaid() {
        return paid;
    }

    public Integer getAmount() {
        return amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getOutcomeType() {
        return outcomeType;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Outcome {

        private String type;

        public String getType() {
            return type;
        }
    }
}
