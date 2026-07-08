package com.vhstudio.formsapi.utils.dtos;

import java.util.UUID;

public record FormQuestionCountDTO(UUID formId, String formTitle, Long totalQuestions) {}
