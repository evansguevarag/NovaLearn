package com.novalearn.learning.wishlist.dto;

import com.novalearn.learning.wishlist.entity.CourseWishlist;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistResponse {

    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String shortDescription;
    private String thumbnailUrl;
    private BigDecimal price;
    private String courseType;
    private String level;
    private String categoryName;
    private LocalDateTime createdAt;

    public WishlistResponse(CourseWishlist wishlist) {
        this.id = wishlist.getId();
        this.courseId = wishlist.getCourse().getId();
        this.courseTitle = wishlist.getCourse().getTitle();
        this.courseSlug = wishlist.getCourse().getSlug();
        this.shortDescription = wishlist.getCourse().getShortDescription();
        this.thumbnailUrl = wishlist.getCourse().getThumbnailUrl();
        this.price = wishlist.getCourse().getPrice();
        this.courseType = wishlist.getCourse().getCourseType().name();
        this.level = wishlist.getCourse().getLevel();
        this.categoryName = wishlist.getCourse().getCategory().getName();
        this.createdAt = wishlist.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getCourseSlug() {
        return courseSlug;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCourseType() {
        return courseType;
    }

    public String getLevel() {
        return level;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
