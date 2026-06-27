package com.novalearn.instructor.course.controller;

import com.novalearn.core.user.entity.User;
import com.novalearn.instructor.security.service.InstructorContentAccessService;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.media.dto.FileUploadResponse;
import com.novalearn.media.service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/instructor/courses")
public class InstructorCourseMediaController {

    private final CloudinaryService cloudinaryService;
    private final CourseRepository courseRepository;
    private final InstructorContentAccessService accessService;

    public InstructorCourseMediaController(
            CloudinaryService cloudinaryService,
            CourseRepository courseRepository,
            InstructorContentAccessService accessService
    ) {
        this.cloudinaryService = cloudinaryService;
        this.courseRepository = courseRepository;
        this.accessService = accessService;
    }

    @PostMapping(
            value = "/{courseId}/thumbnail",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<FileUploadResponse> uploadThumbnail(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User authenticatedUser =
                (User) authentication.getPrincipal();

        Course course = accessService.getAccessibleCourse(
                courseId,
                authenticatedUser
        );

        FileUploadResponse response =
                cloudinaryService.uploadImage(file);

        course.setThumbnailUrl(response.getUrl());
        courseRepository.save(course);

        return ResponseEntity.ok(response);
    }
}
