package com.novalearn.marketplace.dto;

import com.novalearn.learning.course.enums.CourseType;

import java.math.BigDecimal;

public class CourseSearchRequest {

    private String query;
    private Long categoryId;
    private CourseType courseType;
    private String level;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    public String getQuery() {
        return query;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public CourseType getCourseType() {
        return courseType;
    }

    public String getLevel() {
        return level;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
}