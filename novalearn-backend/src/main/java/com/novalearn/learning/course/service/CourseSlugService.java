package com.novalearn.learning.course.service;

import com.novalearn.learning.course.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;

@Service
public class CourseSlugService {

    private final CourseRepository courseRepository;

    public CourseSlugService(
            CourseRepository courseRepository
    ) {
        this.courseRepository = courseRepository;
    }

    public String generateUniqueSlug(String title) {
        String baseSlug = generateSlug(title);
        String candidate = baseSlug;
        int counter = 1;

        while (courseRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + counter;
            counter++;
        }

        return candidate;
    }

    private String generateSlug(String value) {
        String normalized = Normalizer
                .normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        String slug = normalized
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        if (slug.isBlank()) {
            return "curso";
        }

        return slug;
    }
}
