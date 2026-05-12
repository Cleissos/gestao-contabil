package com.PortalContabil.dto;

import java.util.UUID;

public record ClienteResponseDTO(
        UUID id,
        String nome,
        String cpfCnpj,
        String tipo,
        String login, // Pegaremos do UserAccount
        String email
) {
}
