package com.novalearn.learning.module.service;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.learning.module.dto.CourseModuleRequest;
import com.novalearn.learning.module.dto.CourseModuleResponse;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.learning.module.repository.CourseModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseModuleService {

    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public CourseModuleService(
            CourseModuleRepository moduleRepository,
            CourseRepository courseRepository
    ) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public CourseModuleResponse create(CourseModuleRequest request) {

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(request.getTitle().trim());
        module.setDescription(request.getDescription());
        module.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1);
        module.setActive(request.getActive() != null ? request.getActive() : true);

        return new CourseModuleResponse(moduleRepository.save(module));
    }

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> findByCourse(Long courseId) {
        return moduleRepository.findByCourseIdAndDeletedAtIsNullOrderBySortOrderAsc(courseId)
                .stream()
                .map(CourseModuleResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseModuleResponse findById(Long id) {
        CourseModule module = moduleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Modulo no encontrado"));

        return new CourseModuleResponse(module);
    }

    @Transactional
    public CourseModuleResponse update(Long id, CourseModuleRequest request) {
        CourseModule module = moduleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Modulo no encontrado"));

        Course course = courseRepository.findByIdAndDeletedAtIsNull(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        module.setCourse(course);
        module.setTitle(request.getTitle().trim());
        module.setDescription(request.getDescription());

        if (request.getSortOrder() != null) {
            module.setSortOrder(request.getSortOrder());
        }

        if (request.getActive() != null) {
            module.setActive(request.getActive());
        }

        return new CourseModuleResponse(module);
    }

    @Transactional
    public void delete(Long id) {
        CourseModule module = moduleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Modulo no encontrado"));

        module.softDelete();
    }
}