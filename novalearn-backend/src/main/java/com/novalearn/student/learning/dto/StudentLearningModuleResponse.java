package com.novalearn.student.learning.dto;

import com.novalearn.learning.module.entity.CourseModule;

import java.util.List;

public class StudentLearningModuleResponse {

    private final Long id;
    private final Long courseId;
    private final String title;
    private final String description;
    private final Integer sortOrder;
    private final List<StudentLearningLessonResponse> lessons;

    public StudentLearningModuleResponse(
            CourseModule module,
            List<StudentLearningLessonResponse> lessons
    ) {
        this.id = module.getId();
        this.courseId = module.getCourse().getId();
        this.title = module.getTitle();
        this.description = module.getDescription();
        this.sortOrder = module.getSortOrder();
        this.lessons = lessons;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public List<StudentLearningLessonResponse> getLessons() {
        return lessons;
    }
}