package com.vhstudio.formsapi.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vhstudio.formsapi.models.FormResponse;

public interface FormResponseRepository extends JpaRepository<FormResponse, UUID> {
    List<FormResponse> findByFormId(UUID formId);

    boolean existsByAccessToken(String accessToken);

    List<FormResponse> findByFormIdAndRespondentNameContainingIgnoreCase(UUID formId, String respondentName);
}
