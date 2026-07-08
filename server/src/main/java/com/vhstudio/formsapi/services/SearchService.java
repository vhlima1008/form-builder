package com.vhstudio.formsapi.services;

import com.vhstudio.formsapi.models.Form;
import com.vhstudio.formsapi.models.User;
import com.vhstudio.formsapi.repositories.SearchRepository;
import com.vhstudio.formsapi.utils.dtos.FormQuestionCountDTO;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;
import com.vhstudio.formsapi.utils.dtos.FormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.OwnerFormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO;
import com.vhstudio.formsapi.utils.dtos.UserSearchResultDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchService {
    private final SearchRepository searchRepository;
    private final AuthService authService;
    private final FormService formService;

    public SearchService(SearchRepository searchRepository, AuthService authService, FormService formService) {
        this.searchRepository = searchRepository;
        this.authService = authService;
        this.formService = formService;
    }

    @Transactional(readOnly = true)
    public List<FormResponseDTO> listForms(String title, Boolean published) {
        User currentUser = authService.getCurrentUser();
        return searchRepository.listForms(currentUser.getId(), title == null ? "" : title, published);
    }

    @Transactional(readOnly = true)
    public List<FormResponseCountDTO> getFinishedResponseCountsByForm() {
        User currentUser = authService.getCurrentUser();
        return searchRepository.countFinishedResponsesByForm(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<OwnerFormResponseDTO> getResponsesInPeriod(UUID formId, LocalDateTime start, LocalDateTime end) {
        Form form = formService.getOwnedForm(formId);
        User currentUser = authService.getCurrentUser();
        return searchRepository.findResponsesInPeriod(currentUser.getId(), form.getId(), start, end);
    }

    @Transactional(readOnly = true)
    public List<QuestionWithoutAnswerDTO> getQuestionsWithoutAnswersInPeriod(
        UUID formId,
        LocalDateTime start,
        LocalDateTime end
    ) {
        Form form = formService.getOwnedForm(formId);
        User currentUser = authService.getCurrentUser();
        return searchRepository.findQuestionsWithoutAnswersInPeriod(currentUser.getId(), form.getId(), start, end);
    }

    @Transactional(readOnly = true)
    public List<FormQuestionCountDTO> getPublishedFormsMoreCompleteThanDrafts() {
        User currentUser = authService.getCurrentUser();
        return searchRepository.findPublishedFormsMoreCompleteThanDrafts(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<UserSearchResultDTO> getUsersWithPublishedForms() {
        User currentUser = authService.getCurrentUser();
        return searchRepository.findUsersWithPublishedForms(currentUser.getId());
    }
}
