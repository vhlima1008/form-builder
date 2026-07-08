package com.vhstudio.formsapi.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vhstudio.formsapi.models.Form;

public interface FormRepository extends JpaRepository<Form, UUID> {
    List<Form> findByOwnerId(UUID ownerId);

    Optional<Form> findByPublicSlug(String publicSlug);
}
