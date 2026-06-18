package com.novalearn.learning.wishlist.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.learning.wishlist.dto.WishlistRequest;
import com.novalearn.learning.wishlist.dto.WishlistResponse;
import com.novalearn.learning.wishlist.dto.WishlistStatusResponse;
import com.novalearn.learning.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping
    public ResponseEntity<WishlistResponse> add(
            Authentication authentication,
            @Valid @RequestBody WishlistRequest request
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                wishlistService.add(student, request)
        );
    }

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> findMine(
            Authentication authentication
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                wishlistService.findMine(student)
        );
    }

    @GetMapping("/status/{courseId}")
    public ResponseEntity<WishlistStatusResponse> status(
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        User student = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                wishlistService.status(student, courseId)
        );
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> remove(
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        User student = (User) authentication.getPrincipal();

        wishlistService.remove(student, courseId);

        return ResponseEntity.noContent().build();
    }
}
