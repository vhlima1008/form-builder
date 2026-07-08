package com.vhstudio.formsapi.utils.dtos;

import java.util.UUID;

public record UserSearchResultDTO(UUID userId, String name, String email) {}
