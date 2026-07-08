package com.vhstudio.formsapi.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vhstudio.formsapi.models.FormResponse;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;

public interface FormResponseRepository extends JpaRepository<FormResponse, UUID> {
    List<FormResponse> findByFormId(UUID formId);

    boolean existsByAccessToken(String accessToken);

    List<FormResponse> findByFormIdAndRespondentNameContainingIgnoreCase(UUID formId, String respondentName);

    @Query(
        "SELECT new com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO(f.id, f.title, COUNT(fr)) "
            + "FROM FormResponse fr JOIN fr.form f "
            + "WHERE f.owner.id = :ownerId AND f.published = true AND fr.status = 'FINISHED' "
            + "GROUP BY f.id, f.title "
            + "ORDER BY COUNT(fr) DESC"
    )
    List<FormResponseCountDTO> countFinishedResponsesByForm(@Param("ownerId") UUID ownerId);

    @Query(
        "SELECT fr FROM FormResponse fr JOIN fr.form f "
            + "WHERE f.id = :formId AND f.owner.id = :ownerId "
            + "AND fr.createdAt BETWEEN :start AND :end "
            + "ORDER BY fr.createdAt"
    )
    List<FormResponse> findResponsesInPeriod(
        @Param("formId") UUID formId,
        @Param("ownerId") UUID ownerId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
