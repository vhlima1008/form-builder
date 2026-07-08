package com.vhstudio.formsapi.services;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vhstudio.formsapi.models.Form;
import com.vhstudio.formsapi.models.User;
import com.vhstudio.formsapi.repositories.FormRepository;
import com.vhstudio.formsapi.repositories.FormResponseRepository;
import com.vhstudio.formsapi.repositories.QuestionAnswerRepository;
import com.vhstudio.formsapi.repositories.QuestionOptionRepository;
import com.vhstudio.formsapi.repositories.QuestionRepository;
import com.vhstudio.formsapi.repositories.SectionRepository;
import com.vhstudio.formsapi.utils.dtos.CreateFormRequest;
import com.vhstudio.formsapi.utils.dtos.FormDetailsResponse;
import com.vhstudio.formsapi.utils.dtos.FormResponseDTO;
import com.vhstudio.formsapi.utils.dtos.PublicFormResponse;
import com.vhstudio.formsapi.utils.dtos.UpdateFormRequest;
import com.vhstudio.formsapi.utils.exceptions.BadRequestException;
import com.vhstudio.formsapi.utils.exceptions.ForbiddenException;
import com.vhstudio.formsapi.utils.exceptions.ResourceNotFoundException;

@Service
public class FormService {
    private final FormRepository formRepository;
    private final FormResponseRepository formResponseRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final AuthService authService;
    private final DtoMapper dtoMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public FormService(
        FormRepository formRepository,
        FormResponseRepository formResponseRepository,
        SectionRepository sectionRepository,
        QuestionRepository questionRepository,
        QuestionOptionRepository questionOptionRepository,
        QuestionAnswerRepository questionAnswerRepository,
        AuthService authService,
        DtoMapper dtoMapper
    ) {
        this.formRepository = formRepository;
        this.formResponseRepository = formResponseRepository;
        this.sectionRepository = sectionRepository;
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.questionAnswerRepository = questionAnswerRepository;
        this.authService = authService;
        this.dtoMapper = dtoMapper;
    }

    @Transactional
    public FormResponseDTO createForm(CreateFormRequest request) {
        User currentUser = authService.getCurrentUser();
        Form form = new Form();
        form.setOwner(currentUser);
        form.setTitle(request.title());
        form.setDescription(request.description());
        form.setPublished(false);
        return dtoMapper.toFormResponseDTO(formRepository.save(form));
    }

    @Transactional(readOnly = true)
    public List<FormResponseDTO> getUserForms() {
        User currentUser = authService.getCurrentUser();
        return formRepository.findByOwnerId(currentUser.getId()).stream()
            .map(dtoMapper::toFormResponseDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FormResponseDTO> searchUserForms(String title, Boolean published) {
        User currentUser = authService.getCurrentUser();
        String filterTitle = title == null ? "" : title;
        List<Form> forms = published == null
            ? formRepository.findByOwnerIdAndTitleContainingIgnoreCase(currentUser.getId(), filterTitle)
            : formRepository.findByOwnerIdAndTitleContainingIgnoreCaseAndPublished(
                currentUser.getId(),
                filterTitle,
                published
            );
        return forms.stream().map(dtoMapper::toFormResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public FormDetailsResponse getFormById(UUID formId) {
        Form form = getOwnedForm(formId);
        return dtoMapper.toFormDetailsResponse(form);
    }

    @Transactional
    public FormResponseDTO updateForm(UUID formId, UpdateFormRequest request) {
        Form form = getOwnedForm(formId);
        form.setTitle(request.title());
        form.setDescription(request.description());
        return dtoMapper.toFormResponseDTO(formRepository.save(form));
    }

    @Transactional
    public void deleteForm(UUID formId) {
        Form form = getOwnedForm(formId);
        formResponseRepository.findByFormId(form.getId()).forEach(response -> {
            questionAnswerRepository.findByFormResponseId(response.getId()).forEach(questionAnswerRepository::delete);
            formResponseRepository.delete(response);
        });
        questionRepository.findBySectionFormId(form.getId()).forEach(question -> {
            questionOptionRepository.findByQuestionIdOrderByPositionAsc(question.getId()).forEach(questionOptionRepository::delete);
            questionRepository.delete(question);
        });
        sectionRepository.findByFormIdOrderByPositionAsc(form.getId()).forEach(sectionRepository::delete);
        formRepository.delete(form);
    }

    @Transactional
    public FormResponseDTO publishForm(UUID formId) {
        Form form = getOwnedForm(formId);
        if (!sectionRepository.existsByFormId(form.getId())) {
            throw new BadRequestException("Form must have at least one section before publishing");
        }
        form.setPublished(true);
        if (form.getPublicSlug() == null || form.getPublicSlug().isBlank()) {
            form.setPublicSlug(generatePublicSlug());
        }
        return dtoMapper.toFormResponseDTO(formRepository.save(form));
    }

    @Transactional
    public FormResponseDTO unpublishForm(UUID formId) {
        Form form = getOwnedForm(formId);
        form.setPublished(false);
        return dtoMapper.toFormResponseDTO(formRepository.save(form));
    }

    @Transactional(readOnly = true)
    public PublicFormResponse getPublicForm(String publicSlug) {
        Form form = formRepository.findByPublicSlug(publicSlug)
            .orElseThrow(() -> new ResourceNotFoundException("Public form not found"));
        if (!Boolean.TRUE.equals(form.getPublished())) {
            throw new ResourceNotFoundException("Public form not found");
        }
        return dtoMapper.toPublicFormResponse(form);
    }

    public Form getOwnedForm(UUID formId) {
        User currentUser = authService.getCurrentUser();
        Form form = formRepository.findById(formId)
            .orElseThrow(() -> new ResourceNotFoundException("Form not found"));
        if (!form.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have access to this form");
        }
        return form;
    }

    public String generatePublicSlug() {
        String slug;
        do {
            byte[] randomBytes = new byte[8];
            secureRandom.nextBytes(randomBytes);
            slug = HexFormat.of().formatHex(randomBytes);
        } while (formRepository.findByPublicSlug(slug).isPresent());
        return slug;
    }
}
