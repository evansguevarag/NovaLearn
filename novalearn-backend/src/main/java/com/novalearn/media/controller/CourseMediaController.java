package com.novalearn.media.controller;

import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.course.repository.CourseRepository;
import com.novalearn.media.dto.FileUploadResponse;
import com.novalearn.media.service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/courses")
public class CourseMediaController {

    private final CloudinaryService cloudinaryService;
    private final CourseRepository courseRepository;

    public CourseMediaController(
            CloudinaryService cloudinaryService,
            CourseRepository courseRepository
    ) {
        this.cloudinaryService = cloudinaryService;
        this.courseRepository = courseRepository;
    }

    @PostMapping(
            value = "/{courseId}/thumbnail",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<FileUploadResponse> uploadThumbnail(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file
    ) {
        Course course = courseRepository.findByIdAndDeletedAtIsNull(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado"));

        FileUploadResponse response = cloudinaryService.uploadImage(file);

        course.setThumbnailUrl(response.getUrl());

        return ResponseEntity.ok(response);
    }
}