package com.vhstudio.formsapi.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vhstudio.formsapi.services.FormService;
import com.vhstudio.formsapi.utils.dtos.CreateFormRequest;
import com.vhstudio.formsapi.utils.dtos.FormDetailsResponse;
import com.vhstudio.formsapi.utils.dtos.FormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.UpdateFormRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/forms")
public class FormController {
    private final FormService formService;

    public FormController(FormService formService) {
        this.formService = formService;
    }

    @PostMapping
    public ResponseEntity<FormResponseDTO> createForm(@Valid @RequestBody CreateFormRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(formService.createForm(request));
    }

    @GetMapping
    public ResponseEntity<List<FormResponseDTO>> getUserForms() {
        return ResponseEntity.ok(formService.getUserForms());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FormResponseDTO>> searchForms(
        @RequestParam(required = false, defaultValue = "") String title,
        @RequestParam(required = false) Boolean published
    ) {
        return ResponseEntity.ok(formService.searchUserForms(title, published));
    }

    @GetMapping("/{formId}")
    public ResponseEntity<FormDetailsResponse> getFormById(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.getFormById(formId));
    }

    @PutMapping("/{formId}")
    public ResponseEntity<FormResponseDTO> updateForm(
        @PathVariable UUID formId,
        @Valid @RequestBody UpdateFormRequest request
    ) {
        return ResponseEntity.ok(formService.updateForm(formId, request));
    }

    @DeleteMapping("/{formId}")
    public ResponseEntity<Void> deleteForm(@PathVariable UUID formId) {
        formService.deleteForm(formId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{formId}/publish")
    public ResponseEntity<FormResponseDTO> publishForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.publishForm(formId));
    }

    @PatchMapping("/{formId}/unpublish")
    public ResponseEntity<FormResponseDTO> unpublishForm(@PathVariable UUID formId) {
        return ResponseEntity.ok(formService.unpublishForm(formId));
    }
}
