package com.novalearn.admin.dashboard.dto;

import java.math.BigDecimal;

public class MonthlyRevenueResponse {

    private String month;
    private BigDecimal revenue;

    public MonthlyRevenueResponse(String month, BigDecimal revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }
}