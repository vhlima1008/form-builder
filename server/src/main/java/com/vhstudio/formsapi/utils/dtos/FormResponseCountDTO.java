package com.vhstudio.formsapi.utils.dtos;

import java.util.UUID;

public record FormResponseCountDTO(UUID formId, String formTitle, Long totalResponses) {}
