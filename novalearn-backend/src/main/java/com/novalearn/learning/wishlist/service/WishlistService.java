package com.novalearn.learning.wishlist.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.core.user.enums.UserRole;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.enums.CourseStatus;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.wishlist.dto.WishlistRequest;
import com.novalearn.learning.wishlist.dto.WishlistResponse;
import com.novalearn.learning.wishlist.dto.WishlistStatusResponse;
import com.novalearn.learning.wishlist.entity.CourseWishlist;
import com.novalearn.learning.wishlist.repository.CourseWishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final CourseWishlistRepository wishlistRepository;
    private final CourseRepository courseRepository;

    public WishlistService(
            CourseWishlistRepository wishlistRepository,
            CourseRepository courseRepository
    ) {
        this.wishlistRepository = wishlistRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public WishlistResponse add(User student, WishlistRequest request) {

        validateStudent(student);

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new IllegalArgumentException("Solo puedes agregar cursos publicados a favoritos");
        }

        CourseWishlist wishlist = wishlistRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElseGet(() -> {
                    CourseWishlist newWishlist = new CourseWishlist();
                    newWishlist.setStudent(student);
                    newWishlist.setCourse(course);
                    return newWishlist;
                });

        wishlist.restore();

        return new WishlistResponse(wishlistRepository.save(wishlist));
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> findMine(User student) {

        validateStudent(student);

        return wishlistRepository
                .findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(WishlistResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public WishlistStatusResponse status(User student, Long courseId) {

        validateStudent(student);

        boolean favorite = wishlistRepository
                .existsByStudentIdAndCourseIdAndDeletedAtIsNull(student.getId(), courseId);

        return new WishlistStatusResponse(courseId, favorite);
    }

    @Transactional
    public void remove(User student, Long courseId) {

        validateStudent(student);

        CourseWishlist wishlist = wishlistRepository
                .findByStudentIdAndCourseIdAndDeletedAtIsNull(student.getId(), courseId)
                .orElseThrow(() -> new IllegalArgumentException("El curso no esta en favoritos"));

        wishlist.softDelete();
    }

    private void validateStudent(User student) {
        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("Solo los estudiantes pueden gestionar favoritos");
        }
    }
}