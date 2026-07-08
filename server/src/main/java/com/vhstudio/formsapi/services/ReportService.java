package com.vhstudio.formsapi.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vhstudio.formsapi.models.Form;
import com.vhstudio.formsapi.models.FormResponse;
import com.vhstudio.formsapi.models.User;
import com.vhstudio.formsapi.repositories.FormResponseRepository;
import com.vhstudio.formsapi.repositories.QuestionRepository;
import com.vhstudio.formsapi.utils.dtos.FormResponseCountDTO;
import com.vhstudio.formsapi.utils.dtos.OwnerFormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.QuestionWithoutAnswerDTO;

@Service
public class ReportService {
    private final FormResponseRepository formResponseRepository;
    private final QuestionRepository questionRepository;
    private final FormService formService;
    private final AuthService authService;
    private final DtoMapper dtoMapper;

    public ReportService(
        FormResponseRepository formResponseRepository,
        QuestionRepository questionRepository,
        FormService formService,
        AuthService authService,
        DtoMapper dtoMapper
    ) {
        this.formResponseRepository = formResponseRepository;
        this.questionRepository = questionRepository;
        this.formService = formService;
        this.authService = authService;
        this.dtoMapper = dtoMapper;
    }

    @Transactional(readOnly = true)
    public List<FormResponseCountDTO> getFinishedResponseCountsByForm() {
        User currentUser = authService.getCurrentUser();
        return formResponseRepository.countFinishedResponsesByForm(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<OwnerFormResponseDTO> getResponsesInPeriod(UUID formId, LocalDateTime start, LocalDateTime end) {
        Form form = formService.getOwnedForm(formId);
        User currentUser = authService.getCurrentUser();
        List<FormResponse> responses = formResponseRepository.findResponsesInPeriod(
            form.getId(),
            currentUser.getId(),
            start,
            end
        );
        return responses.stream()
            .map(response -> dtoMapper.toOwnerFormResponseDTO(response, List.of()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionWithoutAnswerDTO> getQuestionsWithoutAnswersInPeriod(
        UUID formId,
        LocalDateTime start,
        LocalDateTime end
    ) {
        Form form = formService.getOwnedForm(formId);
        User currentUser = authService.getCurrentUser();
        return questionRepository.findQuestionsWithoutAnswersInPeriod(form.getId(), currentUser.getId(), start, end);
    }
}
