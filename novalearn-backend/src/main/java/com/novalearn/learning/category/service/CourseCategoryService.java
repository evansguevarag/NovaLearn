package com.novalearn.learning.category.service;

import com.novalearn.learning.category.dto.CourseCategoryRequest;
import com.novalearn.learning.category.dto.CourseCategoryResponse;
import com.novalearn.learning.category.entity.CourseCategory;
import com.novalearn.learning.category.repository.CourseCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
public class CourseCategoryService {

    private final CourseCategoryRepository categoryRepository;

    public CourseCategoryService(CourseCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CourseCategoryResponse create(CourseCategoryRequest request) {

        String name = request.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ya existe una categoria con ese nombre");
        }

        String slug = generateSlug(name);

        if (categoryRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Ya existe una categoria con ese slug");
        }

        CourseCategory category = new CourseCategory();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setActive(request.getActive() != null ? request.getActive() : true);

        CourseCategory savedCategory = categoryRepository.save(category);

        return new CourseCategoryResponse(savedCategory);
    }

    @Transactional(readOnly = true)
    public List<CourseCategoryResponse> findAll() {
        return categoryRepository.findByDeletedAtIsNullOrderByNameAsc()
                .stream()
                .map(CourseCategoryResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseCategoryResponse findById(Long id) {
        CourseCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada"));

        return new CourseCategoryResponse(category);
    }

    @Transactional
    public CourseCategoryResponse update(Long id, CourseCategoryRequest request) {
        CourseCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada"));

        String name = request.getName().trim();

        if (!category.getName().equalsIgnoreCase(name)
                && categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Ya existe una categoria con ese nombre");
        }

        String slug = generateSlug(name);

        if (!category.getSlug().equals(slug)
                && categoryRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Ya existe una categoria con ese slug");
        }

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());

        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        return new CourseCategoryResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        CourseCategory category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada"));

        category.softDelete();
    }

    private String generateSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}