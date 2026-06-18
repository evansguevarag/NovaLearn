package com.novalearn.learning.wishlist.dto;

public class WishlistStatusResponse {

    private Long courseId;
    private Boolean favorite;

    public WishlistStatusResponse(Long courseId, Boolean favorite) {
        this.courseId = courseId;
        this.favorite = favorite;
    }

    public Long getCourseId() {
        return courseId;
    }

    public Boolean getFavorite() {
        return favorite;
    }
}