package com.PortalContabil.dto;

import com.PortalContabil.model.enums.UserRole;

import java.util.UUID;

// UserResponseDTO (O que o backend devolve após o login)
//Aqui não enviamos a senha, apenas o essencial e o Token (que faremos depois).
public record UserResponseDTO(
        UUID id,
        String login,
        UserRole role,
        String token
) {
}
