package com.vhstudio.formsapi.controllers;

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

import com.vhstudio.formsapi.services.ReportService;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;
import com.vhstudio.formsapi.utils.dtos.OwnerFormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO;

@RestController
@RequestMapping("/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/response-counts")
    public ResponseEntity<List<FormResponseCountDTO>> getFinishedResponseCounts() {
        return ResponseEntity.ok(reportService.getFinishedResponseCountsByForm());
    }

    @GetMapping("/forms/{formId}/responses-in-period")
    public ResponseEntity<List<OwnerFormResponseDTO>> getResponsesInPeriod(
        @PathVariable UUID formId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(reportService.getResponsesInPeriod(formId, start, end));
    }

    @GetMapping("/forms/{formId}/questions-without-answers")
    public ResponseEntity<List<QuestionWithoutAnswerDTO>> getQuestionsWithoutAnswers(
        @PathVariable UUID formId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return ResponseEntity.ok(reportService.getQuestionsWithoutAnswersInPeriod(formId, start, end));
    }
}
