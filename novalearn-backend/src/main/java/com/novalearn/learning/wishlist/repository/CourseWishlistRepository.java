package com.novalearn.learning.wishlist.repository;

import com.novalearn.learning.wishlist.entity.CourseWishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseWishlistRepository extends JpaRepository<CourseWishlist, Long> {

    Optional<CourseWishlist> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<CourseWishlist> findByStudentIdAndCourseIdAndDeletedAtIsNull(Long studentId, Long courseId);

    boolean existsByStudentIdAndCourseIdAndDeletedAtIsNull(Long studentId, Long courseId);

    List<CourseWishlist> findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long studentId);
}