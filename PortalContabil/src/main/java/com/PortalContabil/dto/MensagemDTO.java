package com.PortalContabil.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

// Para o sistema de chat imutável.
public record MensagemDTO(
//        UUID id,
//        @NotBlank String conteudo,
//        UUID remetenteId,
//        UUID destinatarioId,
//        LocalDateTime dataEnvio

        UUID remetenteId, UUID destinatarioId, String conteudo
) {
}
