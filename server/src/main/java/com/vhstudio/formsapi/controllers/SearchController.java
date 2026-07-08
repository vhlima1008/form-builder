package com.vhstudio.formsapi.controllers;

import com.vhstudio.formsapi.services.SearchService;
import com.vhstudio.formsapi.utils.dtos.FormQuestionCountDTO;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;
import com.vhstudio.formsapi.utils.dtos.UserSearchResultDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/response-counts")
    public ResponseEntity<List<FormResponseCountDTO>> getFinishedResponseCounts() {
        return ResponseEntity.ok(searchService.getFinishedResponseCountsByForm());
    }

    @GetMapping("/forms/more-complete-than-drafts")
    public ResponseEntity<List<FormQuestionCountDTO>> getPublishedFormsMoreCompleteThanDrafts() {
        return ResponseEntity.ok(searchService.getPublishedFormsMoreCompleteThanDrafts());
    }

    @GetMapping("/users/with-published-forms")
    public ResponseEntity<List<UserSearchResultDTO>> getUsersWithPublishedForms() {
        return ResponseEntity.ok(searchService.getUsersWithPublishedForms());
    }
}
