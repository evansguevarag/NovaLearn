package com.novalearn.instructor.module.service;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.module.dto.CourseModuleRequest;
import com.novalearn.learning.module.dto.CourseModuleResponse;
import com.novalearn.learning.module.entity.CourseModule;
import com.novalearn.learning.module.repository.CourseModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InstructorCourseModuleService {

    private final CourseModuleRepository moduleRepository;
    private final InstructorContentAccessService accessService;

    public InstructorCourseModuleService(
            CourseModuleRepository moduleRepository,
            InstructorContentAccessService accessService
    ) {
        this.moduleRepository = moduleRepository;
        this.accessService = accessService;
    }

    @Transactional
    public CourseModuleResponse create(
            CourseModuleRequest request,
            User authenticatedUser
    ) {
        Course course = accessService.getAccessibleCourse(
                request.getCourseId(),
                authenticatedUser
        );

        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(request.getTitle().trim());
        module.setDescription(normalizeNullableText(
                request.getDescription()
        ));
        module.setSortOrder(
                request.getSortOrder() != null
                        ? request.getSortOrder()
                        : 1
        );
        module.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : true
        );

        CourseModule savedModule =
                moduleRepository.save(module);

        return new CourseModuleResponse(savedModule);
    }

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> findByCourse(
            Long courseId,
            User authenticatedUser
    ) {
        accessService.getAccessibleCourse(
                courseId,
                authenticatedUser
        );

        return moduleRepository
                .findByCourseIdAndDeletedAtIsNullOrderBySortOrderAsc(
                        courseId
                )
                .stream()
                .map(CourseModuleResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseModuleResponse findById(
            Long moduleId,
            User authenticatedUser
    ) {
        CourseModule module =
                accessService.getAccessibleModule(
                        moduleId,
                        authenticatedUser
                );

        return new CourseModuleResponse(module);
    }

    @Transactional
    public CourseModuleResponse update(
            Long moduleId,
            CourseModuleRequest request,
            User authenticatedUser
    ) {
        CourseModule module =
                accessService.getAccessibleModule(
                        moduleId,
                        authenticatedUser
                );

        Course targetCourse =
                accessService.getAccessibleCourse(
                        request.getCourseId(),
                        authenticatedUser
                );

        module.setCourse(targetCourse);
        module.setTitle(request.getTitle().trim());
        module.setDescription(normalizeNullableText(
                request.getDescription()
        ));

        if (request.getSortOrder() != null) {
            module.setSortOrder(request.getSortOrder());
        }

        if (request.getActive() != null) {
            module.setActive(request.getActive());
        }

        CourseModule updatedModule =
                moduleRepository.save(module);

        return new CourseModuleResponse(updatedModule);
    }

    @Transactional
    public void delete(
            Long moduleId,
            User authenticatedUser
    ) {
        CourseModule module =
                accessService.getAccessibleModule(
                        moduleId,
                        authenticatedUser
                );

        module.softDelete();
        moduleRepository.save(module);
    }

    private String normalizeNullableText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}
