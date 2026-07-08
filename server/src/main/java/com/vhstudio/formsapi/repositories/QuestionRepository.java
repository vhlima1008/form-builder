package com.vhstudio.formsapi.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vhstudio.formsapi.models.Question;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findBySectionIdOrderByPositionAsc(UUID sectionId);

    List<Question> findBySectionFormId(UUID formId);
}
