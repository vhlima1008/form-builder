package com.vhstudio.formsapi.controllers;

import com.vhstudio.formsapi.services.OwnerResponseService;
import com.vhstudio.formsapi.services.SearchService;
import com.vhstudio.formsapi.utils.dtos.OwnerFormResponseDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/forms/{formId}/responses")
public class OwnerResponseController {
    private final OwnerResponseService ownerResponseService;
    private final SearchService searchService;

    public OwnerResponseController(OwnerResponseService ownerResponseService, SearchService searchService) {
        this.ownerResponseService = ownerResponseService;
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<List<OwnerFormResponseDTO>> listFormResponses(@PathVariable UUID formId) {
        return ResponseEntity.ok(ownerResponseService.listFormResponses(formId));
    }

    @GetMapping("/{responseId}")
    public ResponseEntity<OwnerFormResponseDTO> getFormResponseDetails(
        @PathVariable UUID formId,
        @PathVariable UUID responseId
    ) {
        return ResponseEntity.ok(ownerResponseService.getFormResponseDetails(formId, responseId));
    }

    @GetMapping("/search/period")
    public ResponseEntity<List<OwnerFormResponseDTO>> searchResponsesInPeriod(
        @PathVariable UUID formId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(searchService.getResponsesInPeriod(formId, start, end));
    }

}
