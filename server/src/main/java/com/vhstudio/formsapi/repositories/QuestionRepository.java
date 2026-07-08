package com.vhstudio.formsapi.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vhstudio.formsapi.models.Question;
import com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findBySectionIdOrderByPositionAsc(UUID sectionId);

    List<Question> findBySectionFormId(UUID formId);

    @Query(
        "SELECT new com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO(q.id, q.title) "
            + "FROM Question q JOIN q.section s "
            + "WHERE s.form.id = :formId AND s.form.owner.id = :ownerId "
            + "AND q.id NOT IN ("
            + "  SELECT qa.question.id FROM QuestionAnswer qa "
            + "  WHERE qa.createdAt BETWEEN :start AND :end"
            + ")"
    )
    List<QuestionWithoutAnswerDTO> findQuestionsWithoutAnswersInPeriod(
        @Param("formId") UUID formId,
        @Param("ownerId") UUID ownerId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
