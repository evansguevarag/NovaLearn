package com.novalearn.learning.wishlist.dto;

import jakarta.validation.constraints.NotNull;

public class WishlistRequest {

    @NotNull(message = "El curso es obligatorio")
    private Long courseId;

    public Long getCourseId() {
        return courseId;
    }
}